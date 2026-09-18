package com.example.reconciliation.repository;

import com.example.reconciliation.model.ReconciliationRecord;
import com.example.reconciliation.model.ReconciliationStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReconciliationRecordRepository extends JpaRepository<ReconciliationRecord, UUID> {

    List<ReconciliationRecord> findByStatus(ReconciliationStatus status);
}
