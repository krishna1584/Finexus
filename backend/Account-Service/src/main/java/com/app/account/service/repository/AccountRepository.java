package com.app.account.service.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.app.account.service.model.AccountStatus;
import com.app.account.service.model.AccountType;
import com.app.account.service.model.entity.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {

	
	Optional<Account> findAccountByUserIdAndAccountType(Long userId, AccountType accountType);

	
	Optional<Account> findAccountByAccountNumber(String accountNumber);

	
	/** A user can hold several accounts; this returns the oldest (their primary). */
	Optional<Account> findFirstByUserIdOrderByAccountIdAsc(Long userId);

	/**
	 * Adds {@code delta} (may be negative) to the balance in one SQL statement,
	 * only if the account is in {@code status} and the result stays >= 0.
	 * Returns the number of rows changed: 0 means the guard failed.
	 * Being a single UPDATE, concurrent calls can't overwrite each other.
	 */
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("update Account a set a.availableBalance = a.availableBalance + :delta "
			+ "where a.accountNumber = :accountNumber and a.accountStatus = :status "
			+ "and a.availableBalance + :delta >= 0")
	int adjustBalance(@Param("accountNumber") String accountNumber, @Param("delta") BigDecimal delta,
			@Param("status") AccountStatus status);

	
	List<Account> findAllByUserId(Long userId);
}
