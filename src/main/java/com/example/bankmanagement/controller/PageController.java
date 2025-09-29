package com.example.bankmanagement.controller;

// import com.example.bankmanagement.model.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/signup")
    public String showSignupForm(Model model) {
        // model.addAttribute("user", new User());  // 👈 Important
        return "signup";
    } 


    @GetMapping("/signin")
    public String signinPage() {
        return "signin";
    }

    @GetMapping("/forgot-password")
    public String forgotPasswordPage() {
        return "forgot-password";
    }

    @GetMapping("/account")
    public String accountPage(Model model) {
        // hardcoding accountId for demo, later fetch from logged-in user
        model.addAttribute("accountId", 1L);
        return "dashboard";
    }

    @GetMapping("/admin-dashboard")
    public String adminDashboard(Model model) {
        // hardcoding accountId for demo, later fetch from logged-in user
        model.addAttribute("accountId", 1L);
        return "admin-dashboard";
    }
}

