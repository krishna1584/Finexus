package com.example.bankmanagement.controller;

import com.example.bankmanagement.model.Account;
import com.example.bankmanagement.model.Transaction;
import com.example.bankmanagement.model.User;
import com.example.bankmanagement.repository.AccountRepository;
import com.example.bankmanagement.repository.TransactionRepository;
import com.example.bankmanagement.repository.UserRepository;
import com.example.bankmanagement.service.UserService;
import com.example.bankmanagement.security.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UserRepository userRepo;
    @Autowired private AccountRepository accountRepo;
    @Autowired private TransactionRepository transactionRepo;
    @Autowired private UserService userService;
    @Autowired private JWTUtil jwtUtil;

    @GetMapping("/overview")
    public Map<String, Object> overview() {
        long userCount = userRepo.count();
        double totalBalance = accountRepo.findAll().stream().mapToDouble(Account::getBalance).sum();
        return Map.of("userCount", userCount, "totalBalance", totalBalance);
    }

    @GetMapping("/users")
    public List<Map<String, Object>> listUsers() {
        return userRepo.findAll().stream().map(u -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", u.getId());
            userMap.put("username", u.getUsername());
            userMap.put("email", u.getEmail());
            userMap.put("role", u.getRole());
            
            // Manually find the associated account by matching IDs
            Optional<Account> accountOpt = accountRepo.findById(u.getId());
            userMap.put("accountId", accountOpt.isPresent() ? accountOpt.get().getId() : null);
            
            return userMap;
        }).collect(Collectors.toList());
    }

    @GetMapping("/accounts")
    public List<Map<String, Object>> listAccounts() {
        return accountRepo.findAll().stream().map(account -> {
            Map<String, Object> accountMap = new HashMap<>();
            accountMap.put("id", account.getId());
            accountMap.put("accountHolderName", account.getAccountHolderName());
            accountMap.put("balance", account.getBalance());
            
            // The account ID matches the user ID, so we can use it directly
            accountMap.put("userId", account.getId());
            
            return accountMap;
        }).collect(Collectors.toList());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        // Extract token from Authorization header
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        
        try {
            // Get current admin's user ID from JWT
            Long currentUserId = jwtUtil.extractUserId(token);
            
            // Prevent admin from deleting themselves
            if (currentUserId.equals(id)) {
                return ResponseEntity.status(403).body("You cannot delete your own account");
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        
        Optional<User> optionalUser = userRepo.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = optionalUser.get();

        // 1. First delete all transactions associated with the user's account
        Optional<Account> optionalAccount = accountRepo.findById(id); // Using same ID as user
        if (optionalAccount.isPresent()) {
            Account account = optionalAccount.get();
            // Delete all transactions for this account
            List<Transaction> transactions = transactionRepo.findByAccount(account);
            transactionRepo.deleteAll(transactions);
            
            // Delete the account
            accountRepo.delete(account);
        }

        // 2. Delete user
        userRepo.delete(user);

        return ResponseEntity.ok("User, account, and all transaction history deleted successfully");
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String email = request.get("email");
        String role = request.get("role");

        // Validate input
        if (username == null || username.trim().isEmpty() ||
            password == null || password.trim().isEmpty() ||
            email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username, password, and email are required"));
        }

        // Check if username already exists
        if (userRepo.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        // Check if email already exists
        if (userRepo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }

        // Set default role if not provided
        if (role == null || role.trim().isEmpty()) {
            role = "USER";
        }

        try {
            // Create user using UserService - using email as fullName for now
            User newUser = userService.registerUser(username, password, email, email);
            newUser.setRole(role.toUpperCase());
            userRepo.save(newUser);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User created successfully");
            response.put("userId", newUser.getId());
            response.put("username", newUser.getUsername());
            response.put("email", newUser.getEmail());
            response.put("role", newUser.getRole());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }

}
