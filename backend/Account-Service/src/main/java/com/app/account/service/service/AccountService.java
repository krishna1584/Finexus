package com.app.account.service.service;

import java.util.List;

import com.app.account.service.model.dto.AccountDto;
import com.app.account.service.model.dto.AccountStatusUpdate;
import com.app.account.service.model.dto.external.TransactionResponse;
import com.app.account.service.model.dto.response.Response;

public interface AccountService {

	
	Response createAccount(AccountDto accountDto);

	
	Response updateStatus(String accountNumber, AccountStatusUpdate accountUpdate);

	
	AccountDto readAccountByAccountNumber(String accountNumber);

	
	Response updateAccount(String accountNumber, AccountDto accountDto);

	
	String getBalance(String accountNumber);

	
	List<TransactionResponse> getTransactionsFromAccountId(String accountId);

	
	Response closeAccount(String accountNumber);

	
	AccountDto readAccountByUserId(Long userId);

	
	List<AccountDto> readAllAccountsByUserId(Long userId);

	/** Atomically add a signed amount to an ACTIVE account's balance (never below zero). */
	Response adjustBalance(String accountNumber, java.math.BigDecimal delta);

	/** Atomically move money between two ACTIVE accounts in one DB transaction. */
	Response transfer(String fromAccountNumber, String toAccountNumber, java.math.BigDecimal amount);

	/** Throws AccessDenied unless the account belongs to {@code userId}. No-op when userId is null (internal call). */
	void assertOwner(String accountNumber, Long userId);
}
