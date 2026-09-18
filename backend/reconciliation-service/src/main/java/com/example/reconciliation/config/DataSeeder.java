package com.example.reconciliation.config;

import com.example.reconciliation.model.ReconciliationRecord;
import com.example.reconciliation.model.ReconciliationStatus;
import com.example.reconciliation.repository.ReconciliationRecordRepository;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ReconciliationRecordRepository reconciliationRecordRepository;

    @Override
    public void run(String... args) {
        if (reconciliationRecordRepository.count() > 0) {
            return;
        }

        reconciliationRecordRepository.save(seed(
                "P001",
                new BigDecimal("100.00"),
                new BigDecimal("100.00"),
                new BigDecimal("100.00"),
                ReconciliationStatus.MATCHED));
        reconciliationRecordRepository.save(seed(
                "P002",
                new BigDecimal("250.00"),
                new BigDecimal("250.00"),
                new BigDecimal("0.00"),
                ReconciliationStatus.MISSING));
        reconciliationRecordRepository.save(seed(
                "P003",
                new BigDecimal("500.00"),
                new BigDecimal("450.00"),
                new BigDecimal("450.00"),
                ReconciliationStatus.MISMATCH));
        reconciliationRecordRepository.save(seed(
                "P004",
                new BigDecimal("75.00"),
                new BigDecimal("75.00"),
                new BigDecimal("75.00"),
                ReconciliationStatus.DUPLICATE));
    }

    private ReconciliationRecord seed(
            String paymentId,
            BigDecimal bankAmount,
            BigDecimal processorAmount,
            BigDecimal settlementAmount,
            ReconciliationStatus status) {
        ReconciliationRecord record = new ReconciliationRecord();
        record.setPaymentId(paymentId);
        record.setBankAmount(bankAmount);
        record.setProcessorAmount(processorAmount);
        record.setSettlementAmount(settlementAmount);
        record.setCurrency("EUR");
        record.setStatus(status);
        record.setReconciledAt(Instant.now());
        return record;
    }
}
