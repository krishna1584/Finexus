package com.app.fundtransfer.service.implementation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.app.fundtransfer.exception.AccessDenied;
import com.app.fundtransfer.exception.BadRequest;
import com.app.fundtransfer.exception.GlobalErrorCode;
import com.app.fundtransfer.exception.ResourceNotFound;
import com.app.fundtransfer.external.AccountService;
import com.app.fundtransfer.external.TransactionService;
import com.app.fundtransfer.external.UserService;
import com.app.fundtransfer.model.dto.UserDto;
import com.app.fundtransfer.model.TransactionStatus;
import com.app.fundtransfer.model.TransferType;
import com.app.fundtransfer.model.dto.Account;
import com.app.fundtransfer.model.dto.FundTransferDto;
import com.app.fundtransfer.model.dto.Transaction;
import com.app.fundtransfer.model.dto.request.FundTransferRequest;
import com.app.fundtransfer.model.dto.response.FundTransferResponse;
import com.app.fundtransfer.model.entity.FundTransfer;
import com.app.fundtransfer.model.mapper.FundTransferMapper;
import com.app.fundtransfer.repository.FundTransferRepository;
import com.app.fundtransfer.service.FundTransferService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FundTransferServiceImpl implements FundTransferService {

    private final AccountService accountService;
    private final FundTransferRepository fundTransferRepository;
    private final TransactionService transactionService;
    private final UserService userService;

    @Value("${spring.application.ok}")
    private String ok;

    private final FundTransferMapper fundTransferMapper = new FundTransferMapper();

   
    @Override
    public FundTransferResponse fundTransfer(FundTransferRequest fundTransferRequest, Long authUserId) {

        BigDecimal amount = fundTransferRequest.getAmount();
        if (amount == null || amount.signum() <= 0) {
            // A negative amount used to pull money out of the recipient's account.
            throw new BadRequest("Transfer amount must be greater than zero");
        }

        Account fromAccount;
        ResponseEntity<Account> response = accountService.readByAccountNumber(fundTransferRequest.getFromAccount());
        if(Objects.isNull(response.getBody())){
            log.error("requested account "+fundTransferRequest.getFromAccount()+" is not found on the server");
            throw new ResourceNotFound("requested account not found on the server", GlobalErrorCode.NOT_FOUND);
        }
        fromAccount = response.getBody();
        // You can only send money from your own account.
        assertOwner(fromAccount, authUserId);
        // Account status and balance are checked atomically by Account-Service during the transfer.
        Account toAccount;
        String toAccountStr = fundTransferRequest.getToAccount();
        if (toAccountStr != null && toAccountStr.toUpperCase().startsWith("FIN")) {
            try {
                ResponseEntity<UserDto> userResp = userService.readUserByIdentificationNumber(toAccountStr.toUpperCase());
                if (userResp != null && userResp.getBody() != null) {
                    Long userId = userResp.getBody().getUserId();
                    ResponseEntity<Account> toAccountResp = accountService.readAccountByUserId(userId);
                    if (toAccountResp != null && toAccountResp.getBody() != null) {
                        toAccount = toAccountResp.getBody();
                    } else {
                        log.error("account for user "+toAccountStr+" is not found on the server");
                        throw new ResourceNotFound("account for user " + toAccountStr + " not found on the server", GlobalErrorCode.NOT_FOUND);
                    }
                } else {
                    log.error("user with identification number "+toAccountStr+" is not found on the server");
                    throw new ResourceNotFound("user with unique ID " + toAccountStr + " not found on the server", GlobalErrorCode.NOT_FOUND);
                }
            } catch (Exception e) {
                log.error("Error resolving toAccount: " + e.getMessage());
                if (e instanceof ResourceNotFound) {
                    throw (ResourceNotFound) e;
                }
                throw new ResourceNotFound("Could not resolve unique ID " + toAccountStr, GlobalErrorCode.NOT_FOUND);
            }
        } else {
            response = accountService.readByAccountNumber(toAccountStr);
            if(Objects.isNull(response.getBody())) {
                log.error("requested account "+toAccountStr+" is not found on the server");
                throw new ResourceNotFound("requested account not found on the server", GlobalErrorCode.NOT_FOUND);
            }
            toAccount = response.getBody();
        }
        if (fromAccount.getAccountNumber().equals(toAccount.getAccountNumber())) {
            // Sending to yourself used to create money (two writes to the same row).
            throw new BadRequest("You cannot transfer to the same account");
        }
        String note = fundTransferRequest.getDescription() == null ? "" : fundTransferRequest.getDescription().trim();
        if (note.length() > 140) {
            note = note.substring(0, 140);
        }
        String transactionId = internalTransfer(fromAccount, toAccount, amount, note);
        FundTransfer fundTransfer = FundTransfer.builder()
                .transferType(TransferType.INTERNAL)
                .amount(fundTransferRequest.getAmount())
                .fromAccount(fromAccount.getAccountNumber())
                .transactionReference(transactionId)
                .status(TransactionStatus.SUCCESS)
                .toAccount(toAccount.getAccountNumber()).build();

        fundTransferRepository.save(fundTransfer);
        return FundTransferResponse.builder()
                .transactionId(transactionId)
                .message("Fund transfer was successful").build();
    }

   
    private String internalTransfer(Account fromAccount, Account toAccount, BigDecimal amount, String note) {
        String suffix = note.isEmpty() ? "" : " · " + note;

        // Both legs happen in ONE database transaction inside Account-Service using
        // atomic UPDATEs: either both balances change or neither does, and two
        // simultaneous transfers can't spend the same money twice.
        accountService.transfer(fromAccount.getAccountNumber(), toAccount.getAccountNumber(), amount);

        List<Transaction> transactions = List.of(
                Transaction.builder()
                        .accountId(fromAccount.getAccountNumber())
                        .transactionType("INTERNAL_TRANSFER")
                        .amount(amount.negate())
                        .description("Transfer to " + toAccount.getAccountNumber() + suffix)
                        .build(),
                Transaction.builder()
                        .accountId(toAccount.getAccountNumber())
                        .transactionType("INTERNAL_TRANSFER")
                        .amount(amount)
                        .description("Transfer from " + fromAccount.getAccountNumber() + suffix).build());

        String transactionReference = UUID.randomUUID().toString();
        try {
            transactionService.makeInternalTransactions(transactions, transactionReference);
        } catch (RuntimeException e) {
            // Money moved but the history couldn't be written: move it back so the
            // books stay consistent, then report the failure.
            log.error("Recording transfer {} failed, reversing it", transactionReference, e);
            accountService.transfer(toAccount.getAccountNumber(), fromAccount.getAccountNumber(), amount);
            throw e;
        }
        return transactionReference;
    }

    /** authUserId is null on service-to-service calls; the gateway always sets it for users. */
    private static void assertOwner(Account account, Long authUserId) {
        if (authUserId != null && !authUserId.equals(account.getUserId())) {
            throw new AccessDenied();
        }
    }

    private boolean ownsAccount(String accountNumber, Long authUserId) {
        ResponseEntity<Account> response = accountService.readByAccountNumber(accountNumber);
        return response.getBody() != null && authUserId.equals(response.getBody().getUserId());
    }

    
    @Override
    public FundTransferDto getTransferDetailsFromReferenceId(String referenceId, Long authUserId) {

        FundTransferDto transfer = fundTransferRepository.findFundTransferByTransactionReference(referenceId)
                .map(fundTransferMapper::convertToDto)
                .orElseThrow(() -> new ResourceNotFound("Fund transfer not found", GlobalErrorCode.NOT_FOUND));
        // Only the sender or the receiver may see a transfer.
        if (authUserId != null
                && !ownsAccount(transfer.getFromAccount(), authUserId)
                && !ownsAccount(transfer.getToAccount(), authUserId)) {
            throw new AccessDenied();
        }
        return transfer;
    }

   
    @Override
    public List<FundTransferDto> getAllTransfersByAccountId(String accountId, Long authUserId) {

        if (authUserId != null && !ownsAccount(accountId, authUserId)) {
            throw new AccessDenied();
        }

        return fundTransferMapper.convertToDtoList(fundTransferRepository.findFundTransferByFromAccountOrToAccount(accountId, accountId));
    }
}
