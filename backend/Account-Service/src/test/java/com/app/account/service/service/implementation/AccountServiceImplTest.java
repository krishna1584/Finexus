package com.app.account.service.service.implementation;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.app.account.service.exception.AccessDenied;
import com.app.account.service.exception.AccountClosingException;
import com.app.account.service.exception.AccountStatusException;
import com.app.account.service.exception.GlobalException;
import com.app.account.service.exception.InSufficientFunds;
import com.app.account.service.external.SequenceService;
import com.app.account.service.external.TransactionService;
import com.app.account.service.external.UserService;
import com.app.account.service.model.AccountStatus;
import com.app.account.service.model.AccountType;
import com.app.account.service.model.dto.AccountDto;
import com.app.account.service.model.dto.AccountStatusUpdate;
import com.app.account.service.model.dto.external.SequenceDto;
import com.app.account.service.model.dto.external.UserDto;
import com.app.account.service.model.entity.Account;
import com.app.account.service.repository.AccountRepository;

/** Unit tests for the money rules in Account-Service (no database or Spring needed). */
@ExtendWith(MockitoExtension.class)
class AccountServiceImplTest {

    @Mock private UserService userService;
    @Mock private AccountRepository accountRepository;
    @Mock private SequenceService sequenceService;
    @Mock private TransactionService transactionService;

    @InjectMocks private AccountServiceImpl service;

    private static Account account(String number, long userId, AccountStatus status, String balance) {
        return Account.builder().accountNumber(number).userId(userId).accountStatus(status)
                .accountType(AccountType.SAVINGS).availableBalance(new BigDecimal(balance)).build();
    }

    // ---- transfer ----

    @Test
    void transferRejectsZeroOrNegativeAmounts() {
        assertThrows(GlobalException.class, () -> service.transfer("ACC1", "ACC2", BigDecimal.ZERO));
        assertThrows(GlobalException.class, () -> service.transfer("ACC1", "ACC2", new BigDecimal("-50")));
        verify(accountRepository, never()).adjustBalance(anyString(), any(), any());
    }

    @Test
    void transferRejectsSendingToTheSameAccount() {
        assertThrows(GlobalException.class, () -> service.transfer("ACC1", "ACC1", new BigDecimal("10")));
        verify(accountRepository, never()).adjustBalance(anyString(), any(), any());
    }

    @Test
    void transferDebitsAndCreditsWithAtomicUpdatesInAFixedOrder() {
        when(accountRepository.adjustBalance(anyString(), any(), eq(AccountStatus.ACTIVE))).thenReturn(1);

        service.transfer("ACC2", "ACC1", new BigDecimal("100"));

        // Rows are always touched in account-number order (ACC1 then ACC2) to avoid deadlocks.
        InOrder order = inOrder(accountRepository);
        order.verify(accountRepository).adjustBalance("ACC1", new BigDecimal("100"), AccountStatus.ACTIVE);
        order.verify(accountRepository).adjustBalance("ACC2", new BigDecimal("-100"), AccountStatus.ACTIVE);
    }

    @Test
    void transferFailsWithInsufficientFundsWhenTheDebitGuardRejects() {
        when(accountRepository.adjustBalance("ACC1", new BigDecimal("-500"), AccountStatus.ACTIVE)).thenReturn(0);
        when(accountRepository.findAccountByAccountNumber("ACC1"))
                .thenReturn(Optional.of(account("ACC1", 1, AccountStatus.ACTIVE, "100")));

        assertThrows(InSufficientFunds.class, () -> service.transfer("ACC1", "ACC2", new BigDecimal("500")));
    }

    @Test
    void transferToAClosedAccountIsRefused() {
        when(accountRepository.adjustBalance(eq("ACC1"), any(), any())).thenReturn(1);
        when(accountRepository.adjustBalance("ACC2", new BigDecimal("10"), AccountStatus.ACTIVE)).thenReturn(0);
        when(accountRepository.findAccountByAccountNumber("ACC2"))
                .thenReturn(Optional.of(account("ACC2", 2, AccountStatus.CLOSED, "0")));

        // The exception rolls back the debit (the method is @Transactional).
        assertThrows(AccountStatusException.class, () -> service.transfer("ACC1", "ACC2", new BigDecimal("10")));
    }

    // ---- deposit / withdrawal ----

    @Test
    void adjustBalanceRejectsZero() {
        assertThrows(GlobalException.class, () -> service.adjustBalance("ACC1", BigDecimal.ZERO));
    }

    // ---- account creation ----

    @Test
    void newAccountsAlwaysOpenWithZeroBalanceWhateverTheClientSends() {
        when(userService.readUserById(7L)).thenReturn(ResponseEntity.ok(new UserDto()));
        when(accountRepository.findAccountByUserIdAndAccountType(7L, AccountType.CURRENT)).thenReturn(Optional.empty());
        SequenceDto seq = new SequenceDto();
        seq.setAccountNumber(42L);
        when(sequenceService.generateAccountNumber()).thenReturn(seq);

        AccountDto request = AccountDto.builder().userId(7L).accountType("CURRENT")
                .availableBalance(new BigDecimal("1000000")).build();
        service.createAccount(request);

        ArgumentCaptor<Account> saved = ArgumentCaptor.forClass(Account.class);
        verify(accountRepository).save(saved.capture());
        assertEquals(0, saved.getValue().getAvailableBalance().compareTo(BigDecimal.ZERO));
        assertEquals(AccountStatus.ACTIVE, saved.getValue().getAccountStatus());
    }

    // ---- ownership ----

    @Test
    void ownershipCheckIsSkippedForServiceToServiceCalls() {
        assertDoesNotThrow(() -> service.assertOwner("ACC1", null));
        verify(accountRepository, never()).findAccountByAccountNumber(anyString());
    }

    @Test
    void ownershipCheckRejectsSomeoneElsesAccount() {
        when(accountRepository.findAccountByAccountNumber("ACC1"))
                .thenReturn(Optional.of(account("ACC1", 1, AccountStatus.ACTIVE, "10")));
        assertThrows(AccessDenied.class, () -> service.assertOwner("ACC1", 2L));
        assertDoesNotThrow(() -> service.assertOwner("ACC1", 1L));
    }

    // ---- status changes ----

    @Test
    void anActiveAccountCanBeBlocked() {
        Account acc = account("ACC1", 1, AccountStatus.ACTIVE, "0");
        when(accountRepository.findAccountByAccountNumber("ACC1")).thenReturn(Optional.of(acc));
        AccountStatusUpdate update = new AccountStatusUpdate();
        update.setAccountStatus(AccountStatus.BLOCKED);

        service.updateStatus("ACC1", update);

        assertEquals(AccountStatus.BLOCKED, acc.getAccountStatus());
    }

    @Test
    void anAccountWithMoneyCannotBeClosedThroughAStatusChange() {
        when(accountRepository.findAccountByAccountNumber("ACC1"))
                .thenReturn(Optional.of(account("ACC1", 1, AccountStatus.ACTIVE, "5")));
        AccountStatusUpdate update = new AccountStatusUpdate();
        update.setAccountStatus(AccountStatus.CLOSED);

        assertThrows(AccountClosingException.class, () -> service.updateStatus("ACC1", update));
    }
}
