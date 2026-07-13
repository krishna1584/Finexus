package com.example.bankmanagement.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.bankmanagement.model.PasswordResetToken;
import com.example.bankmanagement.model.User;
import com.example.bankmanagement.repository.PasswordResetTokenRepository;
import com.example.bankmanagement.repository.UserRepository;
import com.example.bankmanagement.security.JWTUtil;
import com.example.bankmanagement.service.EmailService;
import com.example.bankmanagement.service.UserService;

@RestController
@RequestMapping("/api/users")
public class AuthController {

    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthController(UserRepository userRepository, JWTUtil jwtUtil, PasswordEncoder passwordEncoder, 
                         UserService userService, EmailService emailService, 
                         PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        String confirmPassword = request.get("confirmPassword");
        String fullName = request.get("fullName");
        String email = request.get("email");

        // Validation
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is required"));
        }
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        // Basic email validation
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid email address"));
        }
        
        if (password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }
        // Password strength validation
        if (!isValidPassword(password)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters, include uppercase, lowercase, digit, and special character."));
        }
        if (!password.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Passwords do not match"));
        }
        
        if (fullName == null || fullName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Full name is required"));
        }

        // Check if username already exists
        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists"));
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        try {
            // Register user + account
            userService.registerUser(username, password, fullName, email);

            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        // String role = request.get("role");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username"));
        String role =user.getRole();
        // Check password based on role
        if ("USER".equalsIgnoreCase(role)) {
            // Normal plain text check
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new RuntimeException("Invalid password for admin");
            }
        } else if ("ADMIN".equalsIgnoreCase(role)) {
            // Hashed password check
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new RuntimeException("Invalid password for admin");
            }
        } else {
            throw new RuntimeException("Unsupported role");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());

        // Return token with redirect URL
        if (user.getRole().equalsIgnoreCase("admin")) {
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", role,
                    "redirect", "/admin"
            ));
        } else {
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", role,
                    "redirect", "/signup"
            ));
        }

    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        // Check if user exists with this email
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "No account found with this email address"));
        }
        
        try {
            // Clean up any existing tokens for this email
            passwordResetTokenRepository.deleteByEmail(email);
            
            // Generate 6-digit verification code
            String verificationCode = emailService.generateVerificationCode();
            
            // Create and save new token
            PasswordResetToken resetToken = new PasswordResetToken(email, verificationCode);
            passwordResetTokenRepository.save(resetToken);
            
            // Send email with verification code
            emailService.sendPasswordResetEmail(email, verificationCode);
            
            return ResponseEntity.ok(Map.of(
                "message", "Verification code sent to your email address. Please check your inbox."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to send verification email. Please try again later."
            ));
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<Map<String, String>> verifyResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String verificationCode = request.get("verificationCode");
        
        if (email == null || verificationCode == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and verification code are required"));
        }
        
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository
            .findByEmailAndVerificationCodeAndUsedFalse(email, verificationCode);
        
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid verification code"));
        }
        
        PasswordResetToken token = tokenOpt.get();
        if (token.isExpired()) {
            return ResponseEntity.status(400).body(Map.of("message", "Verification code has expired. Please request a new one."));
        }
        
        return ResponseEntity.ok(Map.of("message", "Verification code is valid. You can now reset your password."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String verificationCode = request.get("verificationCode");
        String newPassword = request.get("newPassword");
        
        if (email == null || verificationCode == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email, verification code, and new password are required"));
        }
        
        // Password strength validation
        if (!isValidPassword(newPassword)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 8 characters, include uppercase, lowercase, digit, and special character."));
        }
        
        // Find valid token
        Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository
            .findByEmailAndVerificationCodeAndUsedFalse(email, verificationCode);
        
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid verification code"));
        }
        
        PasswordResetToken token = tokenOpt.get();
        if (token.isExpired()) {
            return ResponseEntity.status(400).body(Map.of("message", "Verification code has expired. Please request a new one."));
        }
        
        // Find user and update password
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        token.setUsed(true);
        passwordResetTokenRepository.save(token);
        
        return ResponseEntity.ok(Map.of("message", "Password reset successfully. You can now log in with your new password."));
    }


    
    // @PostMapping("/login")
    // public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
    //     String username = body.get("username");
    //     String password = body.get("password");
    //     try {
    //         Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    //         // load user to get role
    //         User user = userRepository.findByUsername(username).orElseThrow();
    //         String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());
    //         return ResponseEntity.ok(Map.of("token", token, "role", user.getRole()));
    //     } catch (BadCredentialsException ex) {
    //         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
    //     }
    // }

    // Password validation helper
    private boolean isValidPassword(String password) {
        if (password == null) return false;
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
        String pattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password.matches(pattern);
    }
}

