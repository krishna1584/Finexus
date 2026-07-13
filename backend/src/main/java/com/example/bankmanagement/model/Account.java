package com.example.bankmanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    private Long id; // Will be set to match User ID

    @Column(name = "account_holder_name")
    private String accountHolderName;

    private double balance = 0.0;

    @Transient
    private User user;

    // No-args constructor
    public Account() {
        this.balance = 0.0;
    }

    // Constructor used by AccountMapper
    public Account(Long id, String accountHolderName, double balance) {
        this.id = id;
        this.accountHolderName = accountHolderName;
        this.balance = balance;
    }

    // Constructor for auto-creation when user signs up
    public Account(String accountHolderName, User user) {
        this.accountHolderName = accountHolderName;
        this.user = user;
        this.balance = 0.0;
    }

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAccountHolderName() { return accountHolderName; }
    public void setAccountHolderName(String accountHolderName) { this.accountHolderName = accountHolderName; }

    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }

    public User getUser() { return user; }
    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.accountHolderName = user.getFullName(); // keep names in sync
        }
    }
}
