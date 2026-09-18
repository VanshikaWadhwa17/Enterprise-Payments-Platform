package com.example.fraud.config;

import com.example.fraud.model.FraudCase;
import com.example.fraud.model.FraudCaseStatus;
import com.example.fraud.model.RiskLevel;
import com.example.fraud.repository.FraudCaseRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final FraudCaseRepository fraudCaseRepository;

    @Override
    public void run(String... args) {
        if (fraudCaseRepository.count() > 0) {
            return;
        }

        fraudCaseRepository.save(seed(
                "P10291",
                new BigDecimal("8500.00"),
                "Unknown Payee Ltd",
                92,
                RiskLevel.HIGH,
                List.of("New device", "Unusual location", "High transaction velocity"),
                FraudCaseStatus.OPEN));
        fraudCaseRepository.save(seed(
                "P10142",
                new BigDecimal("450.00"),
                "Amazon",
                18,
                RiskLevel.LOW,
                List.of(),
                FraudCaseStatus.CLEARED));
    }

    private FraudCase seed(
            String paymentId,
            BigDecimal amount,
            String beneficiaryName,
            int score,
            RiskLevel riskLevel,
            List<String> factors,
            FraudCaseStatus status) {
        FraudCase fraudCase = new FraudCase();
        fraudCase.setPaymentId(paymentId);
        fraudCase.setAmount(amount);
        fraudCase.setCurrency("EUR");
        fraudCase.setBeneficiaryName(beneficiaryName);
        fraudCase.setScore(score);
        fraudCase.setRiskLevel(riskLevel);
        fraudCase.setFactors(factors);
        fraudCase.setStatus(status);
        fraudCase.setOpenedAt(Instant.now());
        return fraudCase;
    }
}
