package com.example.fraud.event;

import java.math.BigDecimal;

/**
 * Local copy of payment-service's event contract. Each consuming service owns
 * its own representation of the payload it cares about rather than sharing a
 * library type across service boundaries.
 */
public record PaymentCreatedEvent(
        String paymentId,
        BigDecimal amount,
        String currency,
        String beneficiaryName,
        String beneficiaryAccountNumber,
        String beneficiaryCountry,
        String status,
        String occurredAt) {}
