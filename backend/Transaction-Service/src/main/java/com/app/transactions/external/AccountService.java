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

    /** Atomic balance change; internal endpoint (blocked at the gateway). */
    @PostMapping("/accounts/internal/adjust")
    ResponseEntity<Response> adjustBalance(@RequestParam("accountNumber") String accountNumber,
            @RequestParam("amount") java.math.BigDecimal amount);
}
