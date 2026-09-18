package com.example.audit.repository;

import com.example.audit.model.AuditRecord;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditRecordRepository extends JpaRepository<AuditRecord, UUID> {}
