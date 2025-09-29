package com.example.bankmanagement.dto;

import com.example.bankmanagement.model.Account;
import com.example.bankmanagement.model.User;

public class AccountDto {

    private Long id;
    private String accountHolderName;
    private double balance;

    // No-args constructor
    public AccountDto() {}

    // All-args constructor
    public AccountDto(Long id, String accountHolderName, double balance) {
        this.id = id;
        this.accountHolderName = accountHolderName;
        this.balance = balance;
    }

    // Constructor to create DTO from User entity
    public AccountDto(User user) {
        if (user != null && user.getAccount() != null) {
            this.id = user.getId();
            this.accountHolderName = user.getFullName(); // fullName → accountHolderName
            this.balance = user.getAccount().getBalance(); // initial 0.0
        }
    }

    public AccountDto(Account account) {
        this.id = account.getId();
        this.accountHolderName = account.getAccountHolderName();
        this.balance = account.getBalance();
    }

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAccountHolderName() { return accountHolderName; }
    public void setAccountHolderName(String accountHolderName) { this.accountHolderName = accountHolderName; }

    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
}




//package net.javaguides.banking.dto;
//
//import lombok.Data;
//import lombok.AllArgsConstructor;
//
////to transfer data between client and server
//@Data
//@AllArgsConstructor
//public class AccountDto {
//	
//	public AccountDto(Long id, String accountHolderName, double balance) {
//		// TODO Auto-generated constructor stub
//	}
//	public Long getId() {
//		return id;
//	}
//	public void setId(Long id) {
//		this.id = id;
//	}
//	public String getAccountHolderName() {
//		return accountHolderName;
//	}
//	public void setAccountHolderName(String accountHolderName) {
//		this.accountHolderName = accountHolderName;
//	}
//	public double getBalance() {
//		return balance;
//	}
//	public void setBalance(double balance) {
//		this.balance = balance;
//	}
//	private Long id;
//	private String accountHolderName;
//	private double balance;
//}
