package com.app.fundtransfer.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.app.fundtransfer.configuration.FeignClientConfiguration;
import com.app.fundtransfer.model.dto.UserDto;

@FeignClient(name = "user-service", configuration = FeignClientConfiguration.class)
public interface UserService {

    @GetMapping("/api/users/ident/{identificationNumber}")
    ResponseEntity<UserDto> readUserByIdentificationNumber(@PathVariable("identificationNumber") String identificationNumber);
}
