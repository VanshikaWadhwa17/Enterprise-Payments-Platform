package com.example.payment.event;

import com.example.payment.model.Payment;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    public static final String TOPIC = "payment-events";

    private final KafkaTemplate<String, PaymentCreatedEvent> kafkaTemplate;

    public void publishCreated(Payment payment) {
        PaymentCreatedEvent event = new PaymentCreatedEvent(
                payment.getId().toString(),
                payment.getAmount(),
                payment.getCurrency().name(),
                payment.getBeneficiary().getName(),
                payment.getBeneficiary().getAccountNumber(),
                payment.getBeneficiary().getCountry(),
                payment.getStatus().name(),
                Instant.now().toString());

        kafkaTemplate
                .send(TOPIC, payment.getId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("event=PaymentCreated status=FAILED paymentId={} error={}", payment.getId(), ex.getMessage());
                    } else {
                        log.info("event=PaymentCreated status=SUCCESS paymentId={}", payment.getId());
                    }
                });
    }
}
