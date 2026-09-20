package com.example.fraud.controller;

import com.example.fraud.model.FraudCase;
import com.example.fraud.service.FraudCaseService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class FraudCaseController {

    private final FraudCaseService fraudCaseService;

    @QueryMapping
    @PreAuthorize("hasAuthority('FRAUD_VIEW')")
    public List<FraudCase> fraudCases() {
        return fraudCaseService.findAll();
    }

    @QueryMapping
    @PreAuthorize("hasAuthority('FRAUD_VIEW')")
    public List<FraudCase> highRiskFraudCases() {
        return fraudCaseService.findHighRisk();
    }

    @QueryMapping
    @PreAuthorize("hasAuthority('FRAUD_VIEW')")
    public FraudCase fraudCase(@Argument UUID id) {
        return fraudCaseService.findById(id);
    }

    @MutationMapping
    @PreAuthorize("hasAuthority('FRAUD_REVIEW')")
    public FraudCase investigateFraudCase(@Argument UUID id) {
        return fraudCaseService.investigate(id);
    }

    @MutationMapping
    @PreAuthorize("hasAuthority('FRAUD_REVIEW')")
    public FraudCase approveFraudCase(@Argument UUID id) {
        return fraudCaseService.approve(id);
    }

    @MutationMapping
    @PreAuthorize("hasAuthority('FRAUD_BLOCK')")
    public FraudCase blockFraudCase(@Argument UUID id) {
        return fraudCaseService.block(id);
    }
}
