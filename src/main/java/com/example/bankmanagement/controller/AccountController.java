package com.example.bankmanagement.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.bankmanagement.dto.AccountDto;
import com.example.bankmanagement.service.AccountService;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

	private AccountService accountService;

	public AccountController(AccountService accountService) {
		this.accountService = accountService;
	}
	
	@PostMapping
	public ResponseEntity<AccountDto> addAccount(@RequestBody AccountDto accountDto ){		
		return new ResponseEntity<>(accountService.createAccount(accountDto), HttpStatus.CREATED);
	}
	
	//Get Account REST API
	@GetMapping("/{id}")
	public ResponseEntity<AccountDto> getAccountById(@PathVariable Long id){
		
		AccountDto accountDto = accountService.getAccountById(id);
		return ResponseEntity.ok(accountDto);
	}

	@GetMapping("/by-user/{id}")
	public ResponseEntity<AccountDto> getAccountByUserId(@PathVariable Long id) {
		AccountDto accountDto = accountService.getAccountByUserId(id);
		return accountDto != null ? ResponseEntity.ok(accountDto) : ResponseEntity.notFound().build();
	}


	// Deposit REST API
	@PutMapping("/{id}/deposit")
	
	public ResponseEntity<AccountDto> deposit(@PathVariable Long id, 
			@RequestBody Map<String, Double> request){
		
	double amount = request.get("amount");	
	AccountDto accountDto = accountService.deposit(id, amount);
	return ResponseEntity.ok(accountDto);
	}
	
	
	// withdraw rest api
	@PutMapping("/{id}/withdraw")
	public ResponseEntity<AccountDto> withdraw(@PathVariable Long id, 
			@RequestBody Map<String, Double> request){
		
		
		double amount = request.get("amount");	
		AccountDto accountDto = accountService.withdraw(id, amount);
		return ResponseEntity. ok(accountDto);
		
	}
	
	// Get all accounts rest api
	
	
	@GetMapping
	public ResponseEntity<List<AccountDto>> getAllAccounts(){
		
		
		List<AccountDto> accounts = accountService.getAllAccounts();
		return ResponseEntity.ok(accounts);
		
	}
	
	// delete account rest api
	
	
	
	
	@PutMapping("/{fromId}/transfer/{toId}")
	public ResponseEntity<String> transfer(@PathVariable Long fromId,
	                                       @PathVariable Long toId,
	                                       @RequestBody Map<String, Double> request) {
	    double amount = request.get("amount");
	    accountService.transfer(fromId, toId, amount);
	    return ResponseEntity.ok("Transferred " + amount + " successfully from account " + fromId + " to account " + toId);
	}
	
	
}
