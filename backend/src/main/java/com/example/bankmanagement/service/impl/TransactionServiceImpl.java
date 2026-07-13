package com.example.bankmanagement.service.impl;

import com.example.bankmanagement.model.Transaction;
import com.example.bankmanagement.model.Account;
import com.example.bankmanagement.repository.TransactionRepository;
import com.example.bankmanagement.repository.AccountRepository;
import com.example.bankmanagement.service.TransactionService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Override
    public List<Transaction> getTransactionsByAccountId(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account does not exist"));
        return transactionRepository.findByAccount(account);
    }
}
