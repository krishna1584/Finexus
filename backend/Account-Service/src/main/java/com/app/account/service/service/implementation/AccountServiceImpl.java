package com.app.account.service.service.implementation;

import static com.app.account.service.model.Constants.ACC_PREFIX;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.app.account.service.exception.AccessDenied;
import com.app.account.service.exception.AccountClosingException;
import com.app.account.service.exception.GlobalErrorCode;
import com.app.account.service.exception.GlobalException;
import com.app.account.service.exception.AccountStatusException;
import com.app.account.service.exception.InSufficientFunds;
import com.app.account.service.exception.ResourceConflict;
import com.app.account.service.exception.ResourceNotFound;
import com.app.account.service.external.SequenceService;
import com.app.account.service.external.TransactionService;
import com.app.account.service.external.UserService;
import com.app.account.service.model.AccountStatus;
import com.app.account.service.model.AccountType;
import com.app.account.service.model.dto.AccountDto;
import com.app.account.service.model.dto.AccountStatusUpdate;
import com.app.account.service.model.dto.external.TransactionResponse;
import com.app.account.service.model.dto.external.UserDto;
import com.app.account.service.model.dto.response.Response;
import com.app.account.service.model.entity.Account;
import com.app.account.service.model.mapper.AccountMapper;
import com.app.account.service.repository.AccountRepository;
import com.app.account.service.service.AccountService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

	private final UserService userService;
	private final AccountRepository accountRepository;
	private final SequenceService sequenceService;
	private final TransactionService transactionService;

	private final AccountMapper accountMapper = new AccountMapper();

	@Value("${spring.application.ok}")
	private String success;

	
	@Override
	public Response createAccount(AccountDto accountDto) {

		ResponseEntity<UserDto> user = userService.readUserById(accountDto.getUserId());
		if (Objects.isNull(user.getBody())) {
			throw new ResourceNotFound("user not found on the server");
		}

		accountRepository.findAccountByUserIdAndAccountType(accountDto.getUserId(),
				AccountType.valueOf(accountDto.getAccountType())).ifPresent(account -> {
					log.error("Account already exists on the server");
					throw new ResourceConflict("Account already exists on the server");
				});

		Account account = accountMapper.convertToEntity(accountDto);
		String newAccountNumber = ACC_PREFIX + String.format("%07d", sequenceService.generateAccountNumber().getAccountNumber());
		account.setAccountNumber(newAccountNumber);
		account.setAccountStatus(AccountStatus.ACTIVE);
		// Every account opens empty. Money only arrives through deposits/transfers;
		// a client-supplied opening balance is ignored.
		account.setAvailableBalance(BigDecimal.ZERO);
		account.setAccountType(AccountType.valueOf(accountDto.getAccountType()));
		accountRepository.save(account);
		return Response.builder().responseCode(success).responseMessage("Account created successfully: " + newAccountNumber).build();

	}

	
	@Override
	public Response updateStatus(String accountNumber, AccountStatusUpdate accountUpdate) {

		AccountStatus target = accountUpdate == null ? null : accountUpdate.getAccountStatus();
		if (target == null) {
			throw new GlobalException("A new account status is required", GlobalErrorCode.BAD_REQUEST);
		}
		return accountRepository.findAccountByAccountNumber(accountNumber).map(account -> {
			if (account.getAccountStatus() == target) {
				throw new AccountStatusException("Account is already " + target.name().toLowerCase());
			}
			if (account.getAccountStatus() == AccountStatus.CLOSED) {
				throw new AccountStatusException("A closed account cannot be changed");
			}
			// The minimum-balance rule applies only to (re)activation. Previously every
			// change was refused for active accounts, so they could never be blocked.
			if (target == AccountStatus.ACTIVE
					&& account.getAvailableBalance().compareTo(BigDecimal.valueOf(1000)) < 0) {
				throw new InSufficientFunds("Minimum balance of Rs.1000 is required to activate");
			}
			if (target == AccountStatus.CLOSED && account.getAvailableBalance().compareTo(BigDecimal.ZERO) != 0) {
				throw new AccountClosingException("Balance must be zero to close the account");
			}
			account.setAccountStatus(target);
			accountRepository.save(account);
			return Response.builder().responseMessage("Account updated successfully").responseCode(success).build();
		}).orElseThrow(() -> new ResourceNotFound("Account not on the server"));

	}

	@Override
	public AccountDto readAccountByAccountNumber(String accountNumber) {

		return accountRepository.findAccountByAccountNumber(accountNumber).map(account -> {
			AccountDto accountDto = accountMapper.convertToDto(account);
			accountDto.setAccountType(account.getAccountType().toString());
			accountDto.setAccountStatus(account.getAccountStatus().toString());
			return accountDto;
		}).orElseThrow(ResourceNotFound::new);
	}

	
	@Override
	public Response updateAccount(String accountNumber, AccountDto accountDto) {

		return accountRepository.findAccountByAccountNumber(accountNumber).map(account -> {
			// Balance is intentionally NOT writable here. Overwriting the whole
			// balance let anyone set any amount and lost concurrent updates.
			// Balances change only through adjustBalance() / transfer().
			if (accountDto.getAccountType() != null) {
				try {
					account.setAccountType(AccountType.valueOf(accountDto.getAccountType()));
				} catch (IllegalArgumentException e) {
					// ignore
				}
			}
			if (accountDto.getAccountStatus() != null) {
				try {
					account.setAccountStatus(AccountStatus.valueOf(accountDto.getAccountStatus()));
				} catch (IllegalArgumentException e) {
					// ignore
				}
			}
			accountRepository.save(account);
			return Response.builder().responseCode(success).responseMessage("Account updated successfully").build();
		}).orElseThrow(() -> new ResourceNotFound("Account not found on the server"));
	}


	
	@Override
	public String getBalance(String accountNumber) {

		return accountRepository.findAccountByAccountNumber(accountNumber)
				.map(account -> account.getAvailableBalance().toString()).orElseThrow(ResourceNotFound::new);
	}

	
	@Override
	public List<TransactionResponse> getTransactionsFromAccountId(String accountId) {

		return transactionService.getTransactionsFromAccountId(accountId);
	}

	
	@Override
	public Response closeAccount(String accountNumber) {

		return accountRepository.findAccountByAccountNumber(accountNumber).map(account -> {
			if (BigDecimal.valueOf(Double.parseDouble(getBalance(accountNumber))).compareTo(BigDecimal.ZERO) != 0) {
				throw new AccountClosingException("Balance must be zero to close the account");
			}
			account.setAccountStatus(AccountStatus.CLOSED);
			accountRepository.save(account);
			return Response.builder().responseCode(success).responseMessage("Account closed successfully").build();
		}).orElseThrow(ResourceNotFound::new);

	}

	
	@Override
	public AccountDto readAccountByUserId(Long userId) {

		return accountRepository.findFirstByUserIdOrderByAccountIdAsc(userId).map(account -> {
			AccountDto accountDto = accountMapper.convertToDto(account);
			accountDto.setAccountStatus(account.getAccountStatus().toString());
			accountDto.setAccountType(account.getAccountType().toString());
			return accountDto;
		}).orElseThrow(ResourceNotFound::new);
	}

	@Override
	@Transactional
	public Response adjustBalance(String accountNumber, BigDecimal delta) {
		if (delta == null || delta.signum() == 0) {
			throw new GlobalException("Amount must not be zero", GlobalErrorCode.BAD_REQUEST);
		}
		applyDelta(accountNumber, delta);
		return Response.builder().responseCode(success).responseMessage("Balance updated").build();
	}

	@Override
	@Transactional
	public Response transfer(String fromAccountNumber, String toAccountNumber, BigDecimal amount) {
		if (amount == null || amount.signum() <= 0) {
			throw new GlobalException("Transfer amount must be greater than zero", GlobalErrorCode.BAD_REQUEST);
		}
		if (fromAccountNumber == null || fromAccountNumber.equals(toAccountNumber)) {
			throw new GlobalException("You cannot transfer to the same account", GlobalErrorCode.BAD_REQUEST);
		}
		// Lock rows in a fixed order so two opposite transfers can't deadlock.
		if (fromAccountNumber.compareTo(toAccountNumber) < 0) {
			applyDelta(fromAccountNumber, amount.negate());
			applyDelta(toAccountNumber, amount);
		} else {
			applyDelta(toAccountNumber, amount);
			applyDelta(fromAccountNumber, amount.negate());
		}
		// Any exception above rolls back both legs.
		return Response.builder().responseCode(success).responseMessage("Transfer completed").build();
	}

	/** One atomic UPDATE; explains precisely why it failed when the guard rejects it. */
	private void applyDelta(String accountNumber, BigDecimal delta) {
		int updated = accountRepository.adjustBalance(accountNumber, delta, AccountStatus.ACTIVE);
		if (updated == 1) {
			return;
		}
		Account account = accountRepository.findAccountByAccountNumber(accountNumber)
				.orElseThrow(() -> new ResourceNotFound("Account " + accountNumber + " not found"));
		if (account.getAccountStatus() != AccountStatus.ACTIVE) {
			throw new AccountStatusException("Account " + accountNumber + " is not active");
		}
		throw new InSufficientFunds("Insufficient balance in the account");
	}

	@Override
	public void assertOwner(String accountNumber, Long userId) {
		if (userId == null) {
			return; // service-to-service call, not from the gateway
		}
		Account account = accountRepository.findAccountByAccountNumber(accountNumber)
				.orElseThrow(() -> new ResourceNotFound("Account not found"));
		if (!userId.equals(account.getUserId())) {
			throw new AccessDenied();
		}
	}

	@Override
	public List<AccountDto> readAllAccountsByUserId(Long userId) {

		return accountRepository.findAllByUserId(userId).stream().map(account -> {
			AccountDto accountDto = accountMapper.convertToDto(account);
			accountDto.setAccountStatus(account.getAccountStatus().toString());
			accountDto.setAccountType(account.getAccountType().toString());
			return accountDto;
		}).collect(Collectors.toList());
	}
}