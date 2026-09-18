package com.example.notification.listener;

import com.example.notification.event.PaymentCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Stands in for a real notification channel (email/SMS/push). This service's
 * only job is to react to payment events and notify -- it does not own any
 * payment data itself.
 */
@Component
@Slf4j
public class PaymentEventListener {

    @KafkaListener(topics = "payment-events", groupId = "notification-service")
    public void onPaymentCreated(PaymentCreatedEvent event) {
        log.info(
                "event=PaymentCreated status=NOTIFIED paymentId={} message=\"Payment of {} {} to {} was created\"",
                event.paymentId(),
                event.amount(),
                event.currency(),
                event.beneficiaryName());
    }
}
