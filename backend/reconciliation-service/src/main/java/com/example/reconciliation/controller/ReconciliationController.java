package com.example.reconciliation.controller;

import com.example.reconciliation.model.ReconciliationRecord;
import com.example.reconciliation.model.ReconciliationStatus;
import com.example.reconciliation.service.ReconciliationService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ReconciliationController {

    private final ReconciliationService reconciliationService;

    @QueryMapping
    @PreAuthorize("hasAuthority('RECONCILIATION_VIEW')")
    public List<ReconciliationRecord> reconciliationRecords(@Argument ReconciliationStatus status) {
        return reconciliationService.findAll(status);
    }

    @QueryMapping
    @PreAuthorize("hasAuthority('RECONCILIATION_VIEW')")
    public ReconciliationRecord reconciliationRecord(@Argument UUID id) {
        return reconciliationService.findById(id);
    }
}
