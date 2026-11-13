package com.app.user.service.model.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateUser {

    @NotBlank(message = "First name is required")
    @Size(max = 60, message = "First name is too long")
    private String firstName;

    @Size(max = 60, message = "Last name is too long")
    private String lastName;

    /** Optional. Digits with an optional leading +, spaces or dashes; 10-15 digits. */
    @Pattern(regexp = "^$|^\\+?(?:[\\s-]*\\d){10,15}[\\s-]*$", message = "Enter a valid phone number")
    private String contactNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String emailId;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 40, message = "Password must be 8 to 40 characters")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).*$", message = "Password needs at least one letter and one number")
    private String password;
}
