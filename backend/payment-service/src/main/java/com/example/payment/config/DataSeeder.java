package com.example.payment.config;

import com.example.payment.model.Beneficiary;
import com.example.payment.model.Currency;
import com.example.payment.model.Payment;
import com.example.payment.model.PaymentStatus;
import com.example.payment.repository.PaymentRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PaymentRepository paymentRepository;

    @Override
    public void run(String... args) {
        if (paymentRepository.count() > 0) {
            return;
        }

        paymentRepository.save(seed(
                new BigDecimal("500.00"), Currency.EUR, "John Smith", "IE29AIBK93115212345678", "IE",
                PaymentStatus.COMPLETED));
        paymentRepository.save(seed(
                new BigDecimal("250.00"), Currency.EUR, "Amazon", "DE89370400440532013000", "DE",
                PaymentStatus.PROCESSING));
        paymentRepository.save(seed(
                new BigDecimal("800.00"), Currency.EUR, "Sarah Connor", "FR1420041010050500013M02606", "FR",
                PaymentStatus.FAILED));
    }

    private Payment seed(
            BigDecimal amount,
            Currency currency,
            String beneficiaryName,
            String accountNumber,
            String country,
            PaymentStatus status) {
        Payment payment = new Payment();
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setBeneficiary(new Beneficiary(beneficiaryName, accountNumber, country));
        payment.setStatus(status);
        return payment;
    }
}
