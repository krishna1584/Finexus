package com.example.bankmanagement.repository;

import com.example.bankmanagement.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByEmailAndVerificationCodeAndUsedFalse(String email, String verificationCode);
    
    List<PasswordResetToken> findByEmailAndUsedFalse(String email);
    
    @Query("DELETE FROM PasswordResetToken p WHERE p.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);
    
    void deleteByEmail(String email);
}