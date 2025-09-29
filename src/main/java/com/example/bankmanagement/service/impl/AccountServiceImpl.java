package com.example.bankmanagement.service.impl;
import com.example.bankmanagement.model.Transaction;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.bankmanagement.dto.AccountDto;
import com.example.bankmanagement.model.Account;
import com.example.bankmanagement.mapper.AccountMapper;
import com.example.bankmanagement.repository.AccountRepository;
import com.example.bankmanagement.service.AccountService;
import com.example.bankmanagement.repository.TransactionRepository;

@Service
public class AccountServiceImpl implements AccountService {

	private AccountRepository accountRepository;
	private final TransactionRepository transactionRepository;

	public AccountServiceImpl(AccountRepository accountRepository, TransactionRepository transactionRepository) {
		this.accountRepository = accountRepository;
		this.transactionRepository = transactionRepository;
	}

	@Override
	public AccountDto createAccount(AccountDto accountDto) {
		// TODO Auto-generated method stub
		
		Account account = AccountMapper.mapToAccount(accountDto);
		
		Account savedAccount = accountRepository.save(account);
		return AccountMapper.mapToAccountDto(savedAccount);
	}

	@Override
	public AccountDto getAccountById(Long id) {
		// TODO Auto-generated method stub
	 	Account account = accountRepository
	 			.findById(id)
	 			.orElseThrow(() -> new RuntimeException("Account does not exists."));
	 	
		return AccountMapper.mapToAccountDto(account);
	}

	@Override
    public AccountDto getAccountByUserId(Long id) {
        return accountRepository.findByid(id)
                .map(account -> new AccountDto(account))  // convert entity to DTO
                .orElse(null);
    }


	@Override
	public AccountDto deposit(Long id, double amount) {
		Account account = accountRepository
				.findById(id)
				.orElseThrow(() -> new RuntimeException("Account does not exist."));

		double total = account.getBalance() + amount;
		account.setBalance(total);
		Account savedAccount = accountRepository.save(account);

		// Create transaction
		Transaction txn = new Transaction("DEPOSIT", amount, savedAccount);
		transactionRepository.save(txn);

		return AccountMapper.mapToAccountDto(savedAccount);
	}






	@Override
	public AccountDto withdraw(Long id, double amount) {
		Account account = accountRepository
				.findById(id)
				.orElseThrow(() -> new RuntimeException("Account does not exist."));

		if (account.getBalance() < amount) {
			throw new RuntimeException("Insufficient amount");
		}

		account.setBalance(account.getBalance() - amount);
		Account savedAccount = accountRepository.save(account);

		// Create transaction
		Transaction txn = new Transaction("WITHDRAW", amount, savedAccount);
		transactionRepository.save(txn);

		return AccountMapper.mapToAccountDto(savedAccount);
	}






	@Override
	public List<AccountDto> getAllAccounts() {
		// TODO Auto-generated method stub
		
		List<Account> accounts = accountRepository.findAll();
		
		return accounts.stream().map((account) -> AccountMapper.mapToAccountDto(account))
		.collect(Collectors.toList());
	}





	@Override
	public void deleteAccount(Long id) {
		// TODO Auto-generated method stub
		
		Account account = accountRepository
	 			.findById(id)
	 			.orElseThrow(() -> new RuntimeException("Account does not exists."));
		accountRepository.deleteById(id);
		
		
	}

	@Override
	public AccountDto transfer(Long fromAccountId, Long toAccountId, double amount) {
		Account fromAccount = accountRepository.findById(fromAccountId)
				.orElseThrow(() -> new RuntimeException("Source account does not exist."));

		Account toAccount = accountRepository.findById(toAccountId)
				.orElseThrow(() -> new RuntimeException("Destination account does not exist."));

		if (fromAccount.getBalance() < amount) {
			throw new RuntimeException("Insufficient balance in source account.");
		}

		fromAccount.setBalance(fromAccount.getBalance() - amount);
		toAccount.setBalance(toAccount.getBalance() + amount);

		accountRepository.save(fromAccount);
		accountRepository.save(toAccount);

		// Create transactions
		Transaction txnOut = new Transaction("TRANSFER_OUT", amount, fromAccount);
		Transaction txnIn = new Transaction("TRANSFER_IN", amount, toAccount);

		transactionRepository.save(txnOut);
		transactionRepository.save(txnIn);

		return AccountMapper.mapToAccountDto(fromAccount);
	}


	

}
