package com.example.audit.listener;

import com.example.audit.event.PaymentCreatedEvent;
import com.example.audit.model.AuditRecord;
import com.example.audit.repository.AuditRecordRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final AuditRecordRepository auditRecordRepository;

    @KafkaListener(topics = "payment-events", groupId = "audit-service")
    public void onPaymentCreated(PaymentCreatedEvent event) {
        AuditRecord record = new AuditRecord();
        record.setEventType("PaymentCreated");
        record.setPaymentId(event.paymentId());
        record.setDetails("amount=%s %s beneficiary=%s status=%s"
                .formatted(event.amount(), event.currency(), event.beneficiaryName(), event.status()));
        record.setRecordedAt(Instant.now());

        auditRecordRepository.save(record);

        log.info("event=PaymentCreated status=AUDITED paymentId={}", event.paymentId());
    }
}
