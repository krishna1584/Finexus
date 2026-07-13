package com.example.bankmanagement.service;

import java.util.List;

import com.example.bankmanagement.dto.AccountDto;


public interface AccountService {
	
	AccountDto createAccount(AccountDto account);

	
	AccountDto getAccountById(Long id);
	AccountDto getAccountByUserId(Long userId);

	
	AccountDto deposit(Long id, double amount);
	
	AccountDto withdraw(Long id, double amount);
	
	List<AccountDto> getAllAccounts();
	
	void deleteAccount(Long id);

	AccountDto transfer(Long fromAccountId, Long toAccountId, double amount);

	
}
