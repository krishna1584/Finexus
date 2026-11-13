package com.app.user.service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.app.user.service.model.dto.UserDto;
import com.app.user.service.model.dto.UserUpdate;
import com.app.user.service.model.dto.UserUpdateStatus;
import com.app.user.service.model.dto.response.Response;
import com.app.user.service.service.UserService;

/**
 * User profile endpoints. Registration and sign-in are in AuthController.
 *
 * Reached through the API gateway, which only lets a signed-in user read/update
 * their own /api/users/{id}. The PATCH and lookup endpoints are internal-only
 * (blocked at the gateway) and used by other services.
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** Internal: change a user's status. */
    @PatchMapping("/{id}")
    public ResponseEntity<Response> updateUserStatus(@PathVariable Long id, @RequestBody UserUpdateStatus userUpdate) {
        log.info("updating status of user {} to {}", id, userUpdate.getStatus());
        return ResponseEntity.ok(userService.updateUserStatus(id, userUpdate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response> updateUser(@PathVariable Long id, @RequestBody UserUpdate userUpdate) {
        return ResponseEntity.ok(userService.updateUser(id, userUpdate));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserDto> readUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.readUserById(userId));
    }

    /** Internal: find the owner of an account number. */
    @GetMapping("/accounts/{accountId}")
    public ResponseEntity<UserDto> readUserByAccountId(@PathVariable String accountId) {
        return ResponseEntity.ok(userService.readUserByAccountId(accountId));
    }

    /** Internal: resolve a customer ID such as FIN2 (used by Fund-Transfer). */
    @GetMapping("/ident/{identificationNumber}")
    public ResponseEntity<UserDto> readUserByIdentificationNumber(@PathVariable String identificationNumber) {
        return ResponseEntity.ok(userService.readUserByIdentificationNumber(identificationNumber));
    }
}
