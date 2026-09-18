package com.example.payment.dto;

import com.example.payment.model.Currency;
import java.math.BigDecimal;

public record MoneyDto(BigDecimal amount, Currency currency) {}
