package com.example.payment.dto;

import com.example.payment.model.Currency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CreatePaymentInput(
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotNull Currency currency,
        @NotBlank String beneficiaryName,
        @NotBlank String beneficiaryAccountNumber,
        @NotBlank String beneficiaryCountry,
        String idempotencyKey) {}
