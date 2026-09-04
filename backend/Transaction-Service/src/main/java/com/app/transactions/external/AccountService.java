package com.app.transactions.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.app.transactions.configuration.FeignClientConfiguration;
import com.app.transactions.model.external.Account;
import com.app.transactions.model.response.Response;

@FeignClient(name = "account-service", configuration = FeignClientConfiguration.class)
public interface AccountService {

    
    @GetMapping("/accounts")
    ResponseEntity<Account> readByAccountNumber(@RequestParam("accountNumber") String accountNumber);

   
    @PutMapping("/accounts")
    ResponseEntity<Response> updateAccount(@RequestParam("accountNumber") String accountNumber, @RequestBody Account account);
}
