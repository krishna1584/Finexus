package com.app.fundtransfer.service.implementation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.app.fundtransfer.exception.AccessDenied;
import com.app.fundtransfer.exception.BadRequest;
import com.app.fundtransfer.external.AccountService;
import com.app.fundtransfer.external.TransactionService;
import com.app.fundtransfer.external.UserService;
import com.app.fundtransfer.model.dto.Account;
import com.app.fundtransfer.model.dto.Transaction;
import com.app.fundtransfer.model.dto.request.FundTransferRequest;
import com.app.fundtransfer.repository.FundTransferRepository;

/** Unit tests for the transfer rules (no database or Spring needed). */
@ExtendWith(MockitoExtension.class)
class FundTransferServiceImplTest {

    @Mock private AccountService accountService;
    @Mock private FundTransferRepository fundTransferRepository;
    @Mock private TransactionService transactionService;
    @Mock private UserService userService;

    @InjectMocks private FundTransferServiceImpl service;

    private static Account account(String number, long userId) {
        return Account.builder().accountNumber(number).userId(userId).accountStatus("ACTIVE")
                .availableBalance(new BigDecimal("1000")).build();
    }

    private static FundTransferRequest request(String from, String to, String amount, String note) {
        return FundTransferRequest.builder().fromAccount(from).toAccount(to)
                .amount(new BigDecimal(amount)).description(note).build();
    }

    @Test
    void negativeOrZeroAmountsAreRejectedBeforeAnythingMoves() {
        assertThrows(BadRequest.class, () -> service.fundTransfer(request("ACC1", "ACC2", "-100", null), 1L));
        assertThrows(BadRequest.class, () -> service.fundTransfer(request("ACC1", "ACC2", "0", null), 1L));
        verify(accountService, never()).transfer(anyString(), anyString(), any());
    }

    @Test
    void youCannotSendFromSomeoneElsesAccount() {
        when(accountService.readByAccountNumber("ACC1")).thenReturn(ResponseEntity.ok(account("ACC1", 1)));

        assertThrows(AccessDenied.class, () -> service.fundTransfer(request("ACC1", "ACC2", "10", null), 99L));
        verify(accountService, never()).transfer(anyString(), anyString(), any());
    }

    @Test
    void sendingToYourOwnSameAccountIsRejected() {
        when(accountService.readByAccountNumber("ACC1")).thenReturn(ResponseEntity.ok(account("ACC1", 1)));

        assertThrows(BadRequest.class, () -> service.fundTransfer(request("ACC1", "ACC1", "10", null), 1L));
        verify(accountService, never()).transfer(anyString(), anyString(), any());
    }

    @Test
    void aValidTransferMovesMoneyOnceAndRecordsBothSidesWithTheNote() {
        when(accountService.readByAccountNumber("ACC1")).thenReturn(ResponseEntity.ok(account("ACC1", 1)));
        when(accountService.readByAccountNumber("ACC2")).thenReturn(ResponseEntity.ok(account("ACC2", 2)));

        service.fundTransfer(request("ACC1", "ACC2", "250", "Rent"), 1L);

        verify(accountService).transfer("ACC1", "ACC2", new BigDecimal("250"));
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Transaction>> legs = ArgumentCaptor.forClass(List.class);
        verify(transactionService).makeInternalTransactions(legs.capture(), anyString());
        assertEquals(new BigDecimal("-250"), legs.getValue().get(0).getAmount());
        assertEquals(new BigDecimal("250"), legs.getValue().get(1).getAmount());
        assertEquals("Transfer to ACC2 · Rent", legs.getValue().get(0).getDescription());
        assertEquals("Transfer from ACC1 · Rent", legs.getValue().get(1).getDescription());
    }

    @Test
    void ifTheHistoryCannotBeSavedTheMoneyIsMovedBack() {
        when(accountService.readByAccountNumber("ACC1")).thenReturn(ResponseEntity.ok(account("ACC1", 1)));
        when(accountService.readByAccountNumber("ACC2")).thenReturn(ResponseEntity.ok(account("ACC2", 2)));
        when(transactionService.makeInternalTransactions(anyList(), anyString()))
                .thenThrow(new RuntimeException("transaction-service down"));

        assertThrows(RuntimeException.class, () -> service.fundTransfer(request("ACC1", "ACC2", "40", null), 1L));

        verify(accountService).transfer("ACC1", "ACC2", new BigDecimal("40"));
        verify(accountService).transfer("ACC2", "ACC1", new BigDecimal("40")); // reversal
        verify(fundTransferRepository, never()).save(any());
    }
}
