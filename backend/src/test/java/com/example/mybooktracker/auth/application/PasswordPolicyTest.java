package com.example.mybooktracker.auth.application;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordPolicyTest {

    @Test
    void isValid_ShouldReturnFalse_WhenPasswordIsNull() {
        assertFalse(PasswordPolicy.isValid(null));
    }

    @Test
    void isValid_ShouldReturnTrue_WhenPasswordMatchesPolicy() {
        assertTrue(PasswordPolicy.isValid("Password1234"));
    }

    @Test
    void isValid_ShouldReturnFalse_WhenPasswordIsTooShort() {
        assertFalse(PasswordPolicy.isValid("Pass1234"));
    }

    @Test
    void isValid_ShouldReturnFalse_WhenPasswordHasNoUppercaseCharacter() {
        assertFalse(PasswordPolicy.isValid("password1234"));
    }

    @Test
    void isValid_ShouldReturnFalse_WhenPasswordHasNoLowercaseCharacter() {
        assertFalse(PasswordPolicy.isValid("PASSWORD1234"));
    }

    @Test
    void isValid_ShouldReturnFalse_WhenPasswordHasNoDigit() {
        assertFalse(PasswordPolicy.isValid("PasswordOnly"));
    }

    @Test
    void isValid_ShouldReturnFalse_WhenPasswordExceedsMaxLength() {
        assertFalse(PasswordPolicy.isValid("Password1234Password1234Password1234Password1234Password1234Password1234a"));
    }
}
