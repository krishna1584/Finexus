package com.example.bankmanagement.service;

import com.example.bankmanagement.dto.AuthRequest;
import com.example.bankmanagement.dto.AuthResponse;
import com.example.bankmanagement.dto.UserDto;

public interface AuthService {
    AuthResponse signup(UserDto userDto);
    AuthResponse login(AuthRequest authRequest);
}
