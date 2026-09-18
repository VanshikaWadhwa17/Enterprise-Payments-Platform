package com.example.reconciliation.exception;

import java.util.UUID;

public class ReconciliationRecordNotFoundException extends RuntimeException {

    public ReconciliationRecordNotFoundException(UUID id) {
        super("Reconciliation record not found: " + id);
    }
}
