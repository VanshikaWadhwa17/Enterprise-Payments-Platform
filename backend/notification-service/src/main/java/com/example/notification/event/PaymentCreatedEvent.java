package com.example.notification.event;

import java.math.BigDecimal;

public record PaymentCreatedEvent(
        String paymentId,
        BigDecimal amount,
        String currency,
        String beneficiaryName,
        String beneficiaryAccountNumber,
        String beneficiaryCountry,
        String status,
        String occurredAt) {}
