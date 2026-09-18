package com.example.fraud.service;

import com.example.fraud.exception.FraudCaseNotFoundException;
import com.example.fraud.model.FraudCase;
import com.example.fraud.model.FraudCaseStatus;
import com.example.fraud.model.RiskLevel;
import com.example.fraud.repository.FraudCaseRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FraudCaseService {

    private final FraudCaseRepository fraudCaseRepository;

    public List<FraudCase> findAll() {
        return fraudCaseRepository.findAll();
    }

    public List<FraudCase> findHighRisk() {
        return fraudCaseRepository.findByRiskLevel(RiskLevel.HIGH);
    }

    public FraudCase findById(UUID id) {
        return fraudCaseRepository.findById(id).orElseThrow(() -> new FraudCaseNotFoundException(id));
    }

    @Transactional
    public FraudCase investigate(UUID id) {
        return updateStatus(id, FraudCaseStatus.INVESTIGATING);
    }

    @Transactional
    public FraudCase approve(UUID id) {
        return updateStatus(id, FraudCaseStatus.CLEARED);
    }

    @Transactional
    public FraudCase block(UUID id) {
        return updateStatus(id, FraudCaseStatus.CONFIRMED);
    }

    private FraudCase updateStatus(UUID id, FraudCaseStatus status) {
        FraudCase fraudCase = findById(id);
        fraudCase.setStatus(status);
        return fraudCaseRepository.save(fraudCase);
    }
}
