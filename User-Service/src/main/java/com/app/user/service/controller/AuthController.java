package com.app.user.service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.app.user.service.model.Status;
import com.app.user.service.model.dto.CreateUser;
import com.app.user.service.model.dto.auth.JwtResponse;
import com.app.user.service.model.dto.auth.LoginRequest;
import com.app.user.service.model.dto.response.Response;
import com.app.user.service.model.entity.User;
import com.app.user.service.model.entity.UserProfile;
import com.app.user.service.repository.UserRepository;
import com.app.user.service.security.JwtUtils;
import com.app.user.service.security.UserPrincipal;

import javax.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody CreateUser signUpRequest) {
        if (userRepository.existsByEmailId(signUpRequest.getEmailId())) {
            return ResponseEntity.badRequest()
                    .body(Response.builder()
                            .responseCode("400")
                            .responseMessage("Error: Email is already taken!")
                            .build());
        }

        UserProfile userProfile = UserProfile.builder()
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .build();

        // Create new user's account
        User user = User.builder()
                .emailId(signUpRequest.getEmailId())
                .contactNo(signUpRequest.getContactNumber())
                .password(encoder.encode(signUpRequest.getPassword()))
                .status(Status.ACTIVE)
                .userProfile(userProfile)
                .identificationNumber(UUID.randomUUID().toString())
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(Response.builder()
                .responseCode("200")
                .responseMessage("User registered successfully!")
                .build());
    }
}