package com.app.transactions.service.implementation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.app.transactions.exception.AccessDenied;
import com.app.transactions.exception.BadRequest;
import com.app.transactions.external.AccountService;
import com.app.transactions.model.dto.TransactionDto;
import com.app.transactions.model.entity.Transaction;
import com.app.transactions.model.external.Account;
import com.app.transactions.repository.TransactionRepository;

/** Unit tests for deposits and withdrawals (no database or Spring needed). */
@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private AccountService accountService;

    @InjectMocks private TransactionServiceImpl service;

    private static TransactionDto dto(String type, String amount) {
        return TransactionDto.builder().accountId("ACC1").transactionType(type)
                .amount(new BigDecimal(amount)).description("note").build();
    }

    private void accountOwnedBy(long userId) {
        when(accountService.readByAccountNumber("ACC1")).thenReturn(ResponseEntity.ok(
                Account.builder().accountNumber("ACC1").userId(userId).accountStatus("ACTIVE")
                        .availableBalance(new BigDecimal("100")).build()));
    }

    @Test
    void zeroAndNegativeAmountsAreRejected() {
        assertThrows(BadRequest.class, () -> service.addTransaction(dto("DEPOSIT", "0"), 1L));
        // A negative withdrawal used to ADD money.
        assertThrows(BadRequest.class, () -> service.addTransaction(dto("WITHDRAWAL", "-500"), 1L));
        verify(accountService, never()).adjustBalance(anyString(), any());
    }

    @Test
    void onlyDepositsAndWithdrawalsAreAllowedHere() {
        assertThrows(BadRequest.class, () -> service.addTransaction(dto("INTERNAL_TRANSFER", "10"), 1L));
        assertThrows(BadRequest.class, () -> service.addTransaction(dto("NONSENSE", "10"), 1L));
    }

    @Test
    void youCannotDepositIntoOrWithdrawFromSomeoneElsesAccount() {
        accountOwnedBy(1);
        assertThrows(AccessDenied.class, () -> service.addTransaction(dto("WITHDRAWAL", "10"), 2L));
        verify(accountService, never()).adjustBalance(anyString(), any());
    }

    @Test
    void aWithdrawalSubtractsAtomicallyAndIsStoredAsANegativeAmount() {
        accountOwnedBy(1);

        service.addTransaction(dto("WITHDRAWAL", "30"), 1L);

        verify(accountService).adjustBalance("ACC1", new BigDecimal("-30"));
        ArgumentCaptor<Transaction> saved = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(saved.capture());
        assertEquals(new BigDecimal("-30"), saved.getValue().getAmount());
        assertEquals("note", saved.getValue().getComments());
    }

    @Test
    void ifTheRecordCannotBeSavedTheBalanceChangeIsReversed() {
        accountOwnedBy(1);
        when(transactionRepository.save(any())).thenThrow(new RuntimeException("db down"));

        assertThrows(RuntimeException.class, () -> service.addTransaction(dto("DEPOSIT", "50"), 1L));

        verify(accountService).adjustBalance("ACC1", new BigDecimal("50"));
        verify(accountService).adjustBalance("ACC1", new BigDecimal("-50"));
    }
}
