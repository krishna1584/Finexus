package com.example.bankmanagement.security;

import io.jsonwebtoken.*;

import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JWTUtil {

    private final String SECRET_KEY = "FinexusSecretKey";

    public String generateToken(String username, Long userId, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public String extractUsername(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public Long extractUserId(String token) {
        Claims claims = getClaims(token);
        return claims.get("userId", Long.class);
    }

    public String extractRole(String token) {
        Claims claims = getClaims(token);
        return claims.get("role", String.class);
    }

    // Validate token against user details
    public boolean validateToken(String token, org.springframework.security.core.userdetails.UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    // Check if expired
    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    public Jws<Claims> validateAndGetClaims(String token) {
        return Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
    }
}
