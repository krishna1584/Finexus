package com.example.bankmanagement.service.impl;

import com.example.bankmanagement.dto.AuthRequest;
import com.example.bankmanagement.dto.AuthResponse;
import com.example.bankmanagement.dto.UserDto;
import com.example.bankmanagement.model.User;
import com.example.bankmanagement.repository.UserRepository;
import com.example.bankmanagement.service.AuthService;
import com.example.bankmanagement.security.JWTUtil;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JWTUtil jwtUtil;

    public AuthServiceImpl(UserRepository userRepository, JWTUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public AuthResponse signup(UserDto userDto) {
        User user = new User();
        user.setFullName(userDto.getFullName());
        user.setUsername(userDto.getUsername());
        user.setPassword(userDto.getPassword()); // store as plain text for now
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());
        return new AuthResponse(token);
    }

    @Override
    public AuthResponse login(AuthRequest authRequest) {
        User user = userRepository.findByUsername(authRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(authRequest.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole());
        return new AuthResponse(token);
    }
}
