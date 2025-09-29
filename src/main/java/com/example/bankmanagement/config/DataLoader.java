package com.example.bankmanagement.config;

import com.example.bankmanagement.model.User;
import com.example.bankmanagement.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepo, PasswordEncoder encoder) {
        return args -> {
            if (userRepo.findByUsername("admin").isEmpty()) {
                User admin = new User("admin", "admin123", "System Administrator", "admin@finexus.com");
                admin.setRole("ADMIN");
                // encode password manually to avoid double encoding in service
                admin.setPassword(encoder.encode(admin.getPassword()));
                userRepo.save(admin);
                System.out.println("Default admin created: username=admin password=admin123");
            }
        };
    }
}
