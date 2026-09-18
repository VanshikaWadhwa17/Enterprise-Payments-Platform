package com.example.payment.service;

import com.example.payment.dto.CreatePaymentInput;
import com.example.payment.event.PaymentEventPublisher;
import com.example.payment.exception.PaymentNotFoundException;
import com.example.payment.model.Beneficiary;
import com.example.payment.model.Payment;
import com.example.payment.model.PaymentStatus;
import com.example.payment.repository.PaymentRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher paymentEventPublisher;
    private final IdempotencyService idempotencyService;

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public Payment findById(UUID id) {
        return paymentRepository.findById(id).orElseThrow(() -> new PaymentNotFoundException(id));
    }

    @Transactional
    public Payment create(CreatePaymentInput input) {
        boolean hasIdempotencyKey = input.idempotencyKey() != null && !input.idempotencyKey().isBlank();

        if (hasIdempotencyKey) {
            Optional<UUID> existingPaymentId = idempotencyService.findExisting(input.idempotencyKey());
            if (existingPaymentId.isPresent()) {
                return findById(existingPaymentId.get());
            }
        }

        Payment payment = new Payment();
        payment.setAmount(input.amount());
        payment.setCurrency(input.currency());
        payment.setBeneficiary(new Beneficiary(
                input.beneficiaryName(), input.beneficiaryAccountNumber(), input.beneficiaryCountry()));
        Payment saved = paymentRepository.save(payment);

        if (hasIdempotencyKey) {
            idempotencyService.record(input.idempotencyKey(), saved.getId());
        }

        paymentEventPublisher.publishCreated(saved);
        return saved;
    }

    @Transactional
    public Payment updateStatus(UUID id, PaymentStatus status) {
        Payment payment = findById(id);
        payment.setStatus(status);
        return paymentRepository.save(payment);
    }
}
