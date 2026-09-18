package com.example.fraud.controller;

import com.example.fraud.model.FraudCase;
import com.example.fraud.service.FraudCaseService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class FraudCaseController {

    private final FraudCaseService fraudCaseService;

    @QueryMapping
    public List<FraudCase> fraudCases() {
        return fraudCaseService.findAll();
    }

    @QueryMapping
    public List<FraudCase> highRiskFraudCases() {
        return fraudCaseService.findHighRisk();
    }

    @QueryMapping
    public FraudCase fraudCase(@Argument UUID id) {
        return fraudCaseService.findById(id);
    }

    @MutationMapping
    public FraudCase investigateFraudCase(@Argument UUID id) {
        return fraudCaseService.investigate(id);
    }

    @MutationMapping
    public FraudCase approveFraudCase(@Argument UUID id) {
        return fraudCaseService.approve(id);
    }

    @MutationMapping
    public FraudCase blockFraudCase(@Argument UUID id) {
        return fraudCaseService.block(id);
    }
}
