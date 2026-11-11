package com.app.transactions.service.implementation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.app.transactions.exception.AccessDenied;
import com.app.transactions.exception.BadRequest;
import com.app.transactions.exception.GlobalErrorCode;
import com.app.transactions.exception.ResourceNotFound;
import com.app.transactions.external.AccountService;
import com.app.transactions.model.TransactionStatus;
import com.app.transactions.model.TransactionType;
import com.app.transactions.model.dto.TransactionDto;
import com.app.transactions.model.entity.Transaction;
import com.app.transactions.model.external.Account;
import com.app.transactions.model.mapper.TransactionMapper;
import com.app.transactions.model.response.Response;
import com.app.transactions.model.response.TransactionRequest;
import com.app.transactions.repository.TransactionRepository;
import com.app.transactions.service.TransactionService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    private final TransactionMapper transactionMapper = new TransactionMapper();

    @Value("${spring.application.ok}")
    private String ok;

   
    @Override
    public Response addTransaction(TransactionDto transactionDto, Long authUserId) {

        BigDecimal amount = transactionDto.getAmount();
        if (amount == null || amount.signum() <= 0) {
            throw new BadRequest("Amount must be greater than zero");
        }
        String type = transactionDto.getTransactionType();
        boolean isDeposit = TransactionType.DEPOSIT.name().equals(type);
        boolean isWithdrawal = TransactionType.WITHDRAWAL.name().equals(type);
        if (!isDeposit && !isWithdrawal) {
            // Transfers go through the Fund-Transfer service, never here.
            throw new BadRequest("Transaction type must be DEPOSIT or WITHDRAWAL");
        }

        Account account = loadAccount(transactionDto.getAccountId());
        assertOwner(account, authUserId);

        // One atomic UPDATE in Account-Service: checks the account is ACTIVE and,
        // for withdrawals, that the balance can't go below zero. No read-modify-write.
        BigDecimal delta = isDeposit ? amount : amount.negate();
        accountService.adjustBalance(account.getAccountNumber(), delta);

        Transaction transaction = transactionMapper.convertToEntity(transactionDto);
        transaction.setAmount(delta);
        transaction.setTransactionType(TransactionType.valueOf(type));
        transaction.setComments(transactionDto.getDescription());
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setReferenceId(UUID.randomUUID().toString());
        try {
            transactionRepository.save(transaction);
        } catch (RuntimeException e) {
            // Undo the balance change so money never moves without a record.
            log.error("Saving transaction failed, reversing balance change for {}", account.getAccountNumber(), e);
            accountService.adjustBalance(account.getAccountNumber(), delta.negate());
            throw e;
        }

        return Response.builder()
                .responseMessage("Transaction completed successfully")
                .responseCode(ok).build();
    }

    private Account loadAccount(String accountNumber) {
        ResponseEntity<Account> response = accountService.readByAccountNumber(accountNumber);
        if (Objects.isNull(response.getBody())) {
            throw new ResourceNotFound("Requested account not found on the server", GlobalErrorCode.NOT_FOUND);
        }
        return response.getBody();
    }

    /** authUserId is null on service-to-service calls; the gateway always sets it for users. */
    private static void assertOwner(Account account, Long authUserId) {
        if (authUserId != null && !authUserId.equals(account.getUserId())) {
            throw new AccessDenied();
        }
    }

    @Override
    public Response internalTransaction(List<TransactionDto> transactionDtos, String transactionReference) {

        // Convert the list of transaction DTOs to entities
        List<Transaction> transactions = transactionMapper.convertToEntityList(transactionDtos);

        // Update the status of each transaction to 'COMPLETED'
        transactions.forEach(transaction -> {
            transaction.setTransactionType(TransactionType.INTERNAL_TRANSFER);
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setReferenceId(transactionReference);
        });
        // The DTO field is "description" but the entity stores "comments".
        for (int i = 0; i < transactions.size(); i++) {
            transactions.get(i).setComments(transactionDtos.get(i).getDescription());
        }

        // Save all the completed transactions to the transaction repository
        transactionRepository.saveAll(transactions);

        // Return the response indicating the completion of the transaction
        return Response.builder()
                .responseCode(ok)
                .responseMessage("Transaction completed successfully").build();
    }

   
    @Override
    public List<TransactionRequest> getTransaction(String accountId, Long authUserId) {

        if (authUserId != null) {
            assertOwner(loadAccount(accountId), authUserId);
        }

        return transactionRepository.findTransactionByAccountId(accountId)
                .stream().map(transaction -> {
                    TransactionRequest transactionRequest = new TransactionRequest();
                    BeanUtils.copyProperties(transaction, transactionRequest);
                    transactionRequest.setTransactionStatus(transaction.getStatus().toString());
                    transactionRequest.setLocalDateTime(transaction.getTransactionDate());
                    transactionRequest.setTransactionType(transaction.getTransactionType().toString());
                    return transactionRequest;
                }).collect(Collectors.toList());
    }

   
    @Override
    public List<TransactionRequest> getTransactionByTransactionReference(String transactionReference, Long authUserId) {

        // A transfer has two legs (sender and receiver); only show the caller the legs on their own accounts.
        return transactionRepository.findTransactionByReferenceId(transactionReference)
                .stream()
                .filter(transaction -> authUserId == null
                        || authUserId.equals(loadAccount(transaction.getAccountId()).getUserId()))
                .map(transaction -> {
                    TransactionRequest transactionRequest = new TransactionRequest();
                    BeanUtils.copyProperties(transaction, transactionRequest);
                    transactionRequest.setTransactionStatus(transaction.getStatus().toString());
                    transactionRequest.setLocalDateTime(transaction.getTransactionDate());
                    transactionRequest.setTransactionType(transaction.getTransactionType().toString());
                    return transactionRequest;
                }).collect(Collectors.toList());
    }
}
