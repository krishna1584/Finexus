package com.example.bankmanagement.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.example.bankmanagement.model.Account;
//account repository for permorming crud operations
public interface AccountRepository extends JpaRepository <Account , Long>{
    Optional<Account> findByid(Long id);

}	




