package com.example.bankmanagement.service;

import com.example.bankmanagement.model.Transaction;
import java.util.List;

public interface TransactionService {
    List<Transaction> getTransactionsByAccountId(Long accountId);
}
