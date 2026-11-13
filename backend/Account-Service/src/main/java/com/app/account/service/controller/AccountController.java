package com.app.account.service.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.account.service.exception.AccessDenied;
import com.app.account.service.model.dto.AccountDto;
import com.app.account.service.model.dto.AccountStatusUpdate;
import com.app.account.service.model.dto.external.TransactionResponse;
import com.app.account.service.model.dto.response.Response;
import com.app.account.service.service.AccountService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/accounts")
public class AccountController {

	/** Set by the API gateway from the signed-in user's token; absent on service-to-service calls. */
	private static final String USER_HEADER = "X-Auth-User-Id";

	private final AccountService accountService;

	private static void assertSameUser(Long authUserId, Long userId) {
		if (authUserId != null && !authUserId.equals(userId)) {
			throw new AccessDenied();
		}
	}

	
	@PostMapping
	public ResponseEntity<Response> createAccount(@RequestBody AccountDto accountDto, @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
		assertSameUser(authUserId, accountDto.getUserId());
		return new ResponseEntity<>(accountService.createAccount(accountDto), HttpStatus.CREATED);
	}

	
	@PatchMapping
	public ResponseEntity<Response> updateAccountStatus(@RequestParam String accountNumber,
			@RequestBody AccountStatusUpdate accountStatusUpdate) {
		return ResponseEntity.ok(accountService.updateStatus(accountNumber, accountStatusUpdate));
	}

	
	@GetMapping
	public ResponseEntity<AccountDto> readByAccountNumber(@RequestParam String accountNumber, @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
		accountService.assertOwner(accountNumber, authUserId);
		return ResponseEntity.ok(accountService.readAccountByAccountNumber(accountNumber));
	}

	
	@PutMapping
	public ResponseEntity<Response> updateAccount(@RequestParam String accountNumber,
			@RequestBody AccountDto accountDto) {
		return ResponseEntity.ok(accountService.updateAccount(accountNumber, accountDto));
	}

	
	@GetMapping("/balance")
	public ResponseEntity<String> accountBalance(@RequestParam String accountNumber, @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
		accountService.assertOwner(accountNumber, authUserId);
		return ResponseEntity.ok(accountService.getBalance(accountNumber));
	}

	
	@GetMapping("/{accountId}/transactions")
	public ResponseEntity<List<TransactionResponse>> getTransactionsFromAccountId(@PathVariable String accountId, @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
		accountService.assertOwner(accountId, authUserId);
		return ResponseEntity.ok(accountService.getTransactionsFromAccountId(accountId));
	}

	
	@PutMapping("/closure")
	public ResponseEntity<Response> closeAccount(@RequestParam String accountNumber, @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
		accountService.assertOwner(accountNumber, authUserId);
		return ResponseEntity.ok(accountService.closeAccount(accountNumber));
	}

	
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<AccountDto>> readAllAccountsByUserId(@PathVariable Long userId, @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
		assertSameUser(authUserId, userId);
		return ResponseEntity.ok(accountService.readAllAccountsByUserId(userId));
	}

	
	@GetMapping("/{userId}")
	public ResponseEntity<AccountDto> readAccountByUserId(@PathVariable Long userId, @RequestHeader(value = USER_HEADER, required = false) Long authUserId) {
		assertSameUser(authUserId, userId);
		return ResponseEntity.ok(accountService.readAccountByUserId(userId));

	}

	// ---- Internal endpoints: blocked at the API gateway, called only by other services ----

	/** Atomically add a signed amount (deposit > 0, withdrawal < 0). */
	@PostMapping("/internal/adjust")
	public ResponseEntity<Response> adjustBalance(@RequestParam String accountNumber, @RequestParam BigDecimal amount) {
		return ResponseEntity.ok(accountService.adjustBalance(accountNumber, amount));
	}

	/** Atomically move money between two accounts (both legs in one DB transaction). */
	@PostMapping("/internal/transfer")
	public ResponseEntity<Response> transfer(@RequestParam String fromAccount, @RequestParam String toAccount,
			@RequestParam BigDecimal amount) {
		return ResponseEntity.ok(accountService.transfer(fromAccount, toAccount, amount));
	}
}
