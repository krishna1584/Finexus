package com.app.fundtransfer.external;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;

import com.app.fundtransfer.configuration.FeignClientConfiguration;
import com.app.fundtransfer.model.dto.Account;
import com.app.fundtransfer.model.dto.response.Response;

@FeignClient(name = "account-service", configuration = FeignClientConfiguration.class)
public interface AccountService {

  
    @GetMapping("/accounts")
    ResponseEntity<Account> readByAccountNumber(@RequestParam String accountNumber);

    
    /** Atomic two-leg transfer in one DB transaction; internal endpoint (blocked at the gateway). */
    @PostMapping("/accounts/internal/transfer")
    ResponseEntity<Response> transfer(@RequestParam("fromAccount") String fromAccount,
            @RequestParam("toAccount") String toAccount, @RequestParam("amount") BigDecimal amount);

    @GetMapping("/accounts/{userId}")
    ResponseEntity<Account> readAccountByUserId(@PathVariable("userId") Long userId);
}

