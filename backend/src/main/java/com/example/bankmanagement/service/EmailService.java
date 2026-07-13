package com.example.bankmanagement.service;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    private final SecureRandom random = new SecureRandom();

    /**
     * Generate a 6-digit verification code
     */
    public String generateVerificationCode() {
        int code = 100000 + random.nextInt(900000); // generates 6-digit number
        return String.valueOf(code);
    }

    /**
     * Send password reset email with verification code
     */
    public void sendPasswordResetEmail(String toEmail, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Finexus Bank - Password Reset Verification Code");
            message.setText(String.format(
                "Dear User,\n\n" +
                "You have requested to reset your password for your Finexus Bank account.\n\n" +
                "Your verification code is: %s\n\n" +
                "This code will expire in 10 minutes for security reasons.\n\n" +
                "If you did not request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "Finexus Bank Team",
                verificationCode
            ));
            
            mailSender.send(message);
            System.out.println("Password reset email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email. Please check your email configuration and try again.");
        }
    }

    /**
     * Send welcome email to new users
     */
    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Welcome to Finexus Bank!");
            message.setText(String.format(
                "Dear %s,\n\n" +
                "Welcome to Finexus Bank! Your account has been successfully created.\n\n" +
                "You can now log in to your account and start managing your finances.\n\n" +
                "If you have any questions, please don't hesitate to contact our support team.\n\n" +
                "Best regards,\n" +
                "Finexus Bank Team",
                fullName
            ));
            
            mailSender.send(message);
        } catch (Exception e) {
            // Don't throw exception for welcome email failure, just log it
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }
}