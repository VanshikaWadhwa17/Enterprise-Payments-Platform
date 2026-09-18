package com.example.fraud.service;

import com.example.fraud.event.PaymentCreatedEvent;
import com.example.fraud.model.FraudCase;
import com.example.fraud.model.FraudCaseStatus;
import com.example.fraud.model.RiskLevel;
import com.example.fraud.repository.FraudCaseRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Mock risk-scoring engine. In a real system this would call out to a rules
 * engine / ML model; here it derives a deterministic-per-payment score so the
 * demo data is stable across restarts.
 */
@Service
@RequiredArgsConstructor
public class FraudAssessmentService {

    private static final List<String> FACTOR_POOL = List.of(
            "New device", "Unusual location", "High transaction velocity", "First payment to this beneficiary");

    private final FraudCaseRepository fraudCaseRepository;

    public FraudCase assess(PaymentCreatedEvent event) {
        Random random = new Random(event.paymentId().hashCode());

        int score = amountScore(event.amount());
        List<String> factors = new ArrayList<>();
        for (String factor : FACTOR_POOL) {
            if (random.nextDouble() < 0.4) {
                factors.add(factor);
                score += 15;
            }
        }
        score = Math.min(score, 100);

        FraudCase fraudCase = new FraudCase();
        fraudCase.setPaymentId(event.paymentId());
        fraudCase.setAmount(event.amount());
        fraudCase.setCurrency(event.currency());
        fraudCase.setBeneficiaryName(event.beneficiaryName());
        fraudCase.setScore(score);
        fraudCase.setRiskLevel(riskLevelFor(score));
        fraudCase.setFactors(factors);
        fraudCase.setStatus(FraudCaseStatus.OPEN);
        fraudCase.setOpenedAt(Instant.now());

        return fraudCaseRepository.save(fraudCase);
    }

    private int amountScore(BigDecimal amount) {
        if (amount.compareTo(new BigDecimal("5000")) > 0) {
            return 50;
        }
        if (amount.compareTo(new BigDecimal("1000")) > 0) {
            return 25;
        }
        return 10;
    }

    private RiskLevel riskLevelFor(int score) {
        if (score >= 70) {
            return RiskLevel.HIGH;
        }
        if (score >= 40) {
            return RiskLevel.MEDIUM;
        }
        return RiskLevel.LOW;
    }
}
