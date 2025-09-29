package com.example.bankmanagement.controller;

import com.example.bankmanagement.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private EmailService emailService;

    /**
     * Test endpoint to verify email configuration
     * Usage: POST /api/test/email with body: {"email": "test@example.com"}
     */
    @PostMapping("/email")
    public ResponseEntity<Map<String, String>> testEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        try {
            String testCode = emailService.generateVerificationCode();
            emailService.sendPasswordResetEmail(email, testCode);
            return ResponseEntity.ok(Map.of(
                "message", "Test email sent successfully to " + email,
                "testCode", testCode
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "Failed to send test email: " + e.getMessage()
            ));
        }
    }
}