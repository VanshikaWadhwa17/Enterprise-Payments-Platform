package com.example.reconciliation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reconciliation_records")
@Getter
@Setter
@NoArgsConstructor
public class ReconciliationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String paymentId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal bankAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal processorAmount;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal settlementAmount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReconciliationStatus status;

    @Column(nullable = false, updatable = false)
    private Instant reconciledAt;
}
