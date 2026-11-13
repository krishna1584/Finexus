package com.app.user.service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.app.user.service.model.Status;
import com.app.user.service.model.dto.CreateUser;
import com.app.user.service.model.dto.auth.ChangePasswordRequest;
import com.app.user.service.model.dto.auth.JwtResponse;
import com.app.user.service.model.dto.auth.LoginRequest;
import com.app.user.service.model.dto.response.Response;
import com.app.user.service.model.entity.User;
import com.app.user.service.model.entity.UserProfile;
import com.app.user.service.model.external.Account;
import com.app.user.service.external.AccountService;
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
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AccountService accountService;

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
                .build();

        User savedUser = userRepository.save(user);

        // Customer ID = "FIN" + the database id. The id is unique and assigned by the
        // database, so two sign-ups at the same moment can't get the same customer ID
        // (the old "read every user and add 1" approach could, and got slower as users grew).
        // If an older, differently-numbered ID already uses that value, step past it.
        long candidate = savedUser.getId();
        String nextIdent = "FIN" + candidate;
        while (userRepository.existsByIdentificationNumber(nextIdent)) {
            nextIdent = "FIN" + (++candidate);
        }
        savedUser.setIdentificationNumber(nextIdent);
        savedUser = userRepository.save(savedUser);

        // Auto-create a default SAVINGS account for this user
        try {
            Account accountRequest = Account.builder()
                    .userId(savedUser.getId())
                    .accountType("SAVINGS")
                    .build();
            accountService.createAccount(accountRequest);
            log.info("Auto-created SAVINGS account for user id={} ({})", savedUser.getId(), nextIdent);
        } catch (Exception e) {
            log.warn("Could not auto-create account for user id={}: {}", savedUser.getId(), e.getMessage());
        }

        return ResponseEntity.ok(Response.builder()
                .responseCode("200")
                .responseMessage("User registered successfully!")
                .build());
    }

    /**
     * Change the signed-in user's password. The user id comes from the API
     * gateway (taken from the verified login token), never from the request body.
     */
    @PostMapping("/change-password")
    public ResponseEntity<Response> changePassword(
            @RequestHeader(value = "X-Auth-User-Id", required = false) Long authUserId,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (authUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Response.builder().responseCode("401").responseMessage("Please sign in").build());
        }
        User user = userRepository.findById(authUserId).orElse(null);
        if (user == null || user.getPassword() == null
                || !encoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Response.builder().responseCode("400").responseMessage("Current password is incorrect").build());
        }
        if (encoder.matches(request.getNewPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Response.builder().responseCode("400")
                            .responseMessage("New password must be different from the current one").build());
        }
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user id={}", authUserId);
        return ResponseEntity.ok(Response.builder().responseCode("200").responseMessage("Password updated").build());
    }
}