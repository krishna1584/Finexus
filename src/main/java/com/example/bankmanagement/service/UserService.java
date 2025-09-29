package com.example.bankmanagement.service;

import com.example.bankmanagement.model.Account;
import com.example.bankmanagement.model.User;
import com.example.bankmanagement.repository.AccountRepository;
import com.example.bankmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AccountRepository accountRepo;

    // ✅ Register a new user and return User entity
    public User registerUser(String username, String password, String fullName, String email) {
        // 1. Create user
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setFullName(fullName);
        newUser.setEmail(email);
        newUser.setRole("USER");
        userRepo.save(newUser);

        // 2. Create linked account with same ID as user
        Account acc = new Account();
        acc.setId(newUser.getId()); // Set account ID to match user ID
        acc.setAccountHolderName(fullName);
        acc.setBalance(0.0); // default balance
        acc.setUser(newUser);
        accountRepo.save(acc);

        // 3. Return user (account is accessible via user.getAccount())
        return newUser;
    }

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // role should be set by caller (default "USER")
        return userRepo.save(user);
    }

    // Optional: simple register returning User entity
    // public User register(User user) {
    //     return userRepo.save(user);
    // }

    // Login method by username
    public Optional<User> login(String username) {
        return userRepo.findByUsername(username);
    }
}
