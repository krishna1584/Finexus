package com.app.user.service.service.implementation;

import java.util.Objects;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.user.service.exception.EmptyFields;
import com.app.user.service.exception.ResourceNotFound;
import com.app.user.service.external.AccountService;
import com.app.user.service.model.dto.UserDto;
import com.app.user.service.model.dto.UserUpdate;
import com.app.user.service.model.dto.UserUpdateStatus;
import com.app.user.service.model.dto.response.Response;
import com.app.user.service.model.entity.User;
import com.app.user.service.model.external.Account;
import com.app.user.service.model.mapper.UserMapper;
import com.app.user.service.repository.UserRepository;
import com.app.user.service.service.UserService;
import com.app.user.service.utils.FieldChecker;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * User profile operations. Registration and sign-in live in AuthController
 * (local accounts with BCrypt passwords and JWTs); there is no Keycloak.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AccountService accountService;

    private final UserMapper userMapper = new UserMapper();

    @Value("${spring.application.success}")
    private String responseCodeSuccess;

    @Value("${spring.application.not_found}")
    private String responseCodeNotFound;

    @Override
    public Response updateUserStatus(Long id, UserUpdateStatus userUpdate) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new ResourceNotFound("User not found on the server"));

        if (FieldChecker.hasEmptyFields(user)) {
            log.error("User is not updated completely");
            throw new EmptyFields("please updated the user", responseCodeNotFound);
        }

        user.setStatus(userUpdate.getStatus());
        userRepository.save(user);
        return Response.builder()
                .responseMessage("User updated successfully")
                .responseCode(responseCodeSuccess).build();
    }

    @Override
    public UserDto readUserById(Long userId) {
        return userRepository.findById(userId)
                .map(userMapper::convertToDto)
                .orElseThrow(() -> new ResourceNotFound("User not found on the server"));
    }

    @Override
    public Response updateUser(Long id, UserUpdate userUpdate) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("User not found on the server"));
        user.setContactNo(userUpdate.getContactNo());
        BeanUtils.copyProperties(userUpdate, user.getUserProfile());
        userRepository.save(user);
        return Response.builder()
                .responseCode(responseCodeSuccess)
                .responseMessage("user updated successfully").build();
    }

    @Override
    public UserDto readUserByAccountId(String accountId) {
        ResponseEntity<Account> response = accountService.readByAccountNumber(accountId);
        if (Objects.isNull(response.getBody())) {
            throw new ResourceNotFound("account not found on the server");
        }
        Long userId = response.getBody().getUserId();
        return userRepository.findById(userId)
                .map(userMapper::convertToDto)
                .orElseThrow(() -> new ResourceNotFound("User not found on the server"));
    }

    @Override
    public UserDto readUserByIdentificationNumber(String identificationNumber) {
        User user = userRepository.findByIdentificationNumber(identificationNumber)
                .orElseThrow(() -> new ResourceNotFound("User not found on the server"));
        return userMapper.convertToDto(user);
    }
}
