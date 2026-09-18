package com.example.payment.model;

public enum PaymentStatus {
    CREATED,
    VALIDATED,
    PENDING_APPROVAL,
    APPROVED,
    PROCESSING,
    COMPLETED,
    FAILED,
    REJECTED,
    CANCELLED
}
