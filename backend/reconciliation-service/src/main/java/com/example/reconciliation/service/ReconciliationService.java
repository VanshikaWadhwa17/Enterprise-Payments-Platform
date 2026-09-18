package com.example.reconciliation.service;

import com.example.reconciliation.exception.ReconciliationRecordNotFoundException;
import com.example.reconciliation.model.ReconciliationRecord;
import com.example.reconciliation.model.ReconciliationStatus;
import com.example.reconciliation.repository.ReconciliationRecordRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReconciliationService {

    private final ReconciliationRecordRepository reconciliationRecordRepository;

    public List<ReconciliationRecord> findAll(ReconciliationStatus status) {
        if (status == null) {
            return reconciliationRecordRepository.findAll();
        }
        return reconciliationRecordRepository.findByStatus(status);
    }

    public ReconciliationRecord findById(UUID id) {
        return reconciliationRecordRepository
                .findById(id)
                .orElseThrow(() -> new ReconciliationRecordNotFoundException(id));
    }
}
