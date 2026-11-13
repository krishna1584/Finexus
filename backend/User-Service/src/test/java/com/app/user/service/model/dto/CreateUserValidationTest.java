package com.app.user.service.model.dto;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import javax.validation.Validation;
import javax.validation.Validator;

import org.junit.jupiter.api.Test;

import com.app.user.service.model.dto.auth.ChangePasswordRequest;

/** The sign-up and change-password rules the API enforces (matches the frontend forms). */
class CreateUserValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private static CreateUser user(String password, String phone) {
        return CreateUser.builder().firstName("Asha").lastName("Rao").emailId("asha@example.com")
                .password(password).contactNumber(phone).build();
    }

    private boolean valid(Object o) {
        return validator.validate(o).isEmpty();
    }

    @Test
    void aNormalSignUpIsAccepted() {
        assertTrue(valid(user("secret123", "+91 98765 43210")));
        assertTrue(valid(user("secret123", "")));   // phone is optional
        assertTrue(valid(user("secret123", null)));
    }

    @Test
    void weakPasswordsAreRejected() {
        assertFalse(valid(user("abc1", null)), "too short");
        assertFalse(valid(user("onlyletters", null)), "no number");
        assertFalse(valid(user("12345678", null)), "no letter");
    }

    @Test
    void badPhoneNumbersAreRejected() {
        assertFalse(valid(user("secret123", "12345")), "too few digits");
        assertFalse(valid(user("secret123", "call me")), "not a number");
    }

    @Test
    void missingEmailOrNameIsRejected() {
        assertFalse(valid(CreateUser.builder().firstName("Asha").password("secret123").build()));
        assertFalse(valid(CreateUser.builder().emailId("a@b.co").password("secret123").build()));
    }

    @Test
    void changePasswordUsesTheSameRules() {
        assertTrue(valid(new ChangePasswordRequest("old", "newpass123")));
        assertFalse(valid(new ChangePasswordRequest("old", "short1")));
    }
}
