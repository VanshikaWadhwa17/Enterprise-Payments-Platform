package com.example.fraud.listener;

import com.example.fraud.event.PaymentCreatedEvent;
import com.example.fraud.model.FraudCase;
import com.example.fraud.service.FraudAssessmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final FraudAssessmentService fraudAssessmentService;

    @KafkaListener(topics = "payment-events", groupId = "fraud-service")
    public void onPaymentCreated(PaymentCreatedEvent event) {
        FraudCase fraudCase = fraudAssessmentService.assess(event);
        log.info(
                "event=PaymentCreated status=ASSESSED paymentId={} score={} riskLevel={}",
                event.paymentId(),
                fraudCase.getScore(),
                fraudCase.getRiskLevel());
    }
}
