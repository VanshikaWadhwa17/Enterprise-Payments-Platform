package com.example.fraud.repository;

import com.example.fraud.model.FraudCase;
import com.example.fraud.model.RiskLevel;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FraudCaseRepository extends JpaRepository<FraudCase, UUID> {

    List<FraudCase> findByRiskLevel(RiskLevel riskLevel);
}
