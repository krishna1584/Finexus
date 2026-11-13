package com.app.user.service.service;

import com.app.user.service.model.dto.UserDto;
import com.app.user.service.model.dto.UserUpdate;
import com.app.user.service.model.dto.UserUpdateStatus;
import com.app.user.service.model.dto.response.Response;

public interface UserService {

    Response updateUserStatus(Long id, UserUpdateStatus userUpdate);

    Response updateUser(Long id, UserUpdate userUpdate);

    UserDto readUserById(Long userId);

    UserDto readUserByAccountId(String accountId);

    UserDto readUserByIdentificationNumber(String identificationNumber);
}
