package com.example.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SignupRequest(
        @NotBlank(message = "Full name is required") String fullName,
        @NotBlank(message = "Email is required") @Email(message = "Enter a valid email address") String email,
        @NotBlank(message = "Password is required")
                @Pattern(
                        regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                        message = "Password must be at least 8 characters and include a letter and a number")
                String password,
        @NotBlank(message = "Please confirm your password") String confirmPassword) {}
