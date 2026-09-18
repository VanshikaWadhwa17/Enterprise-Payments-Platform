package com.example.payment.controller;

import com.example.payment.dto.CreatePaymentInput;
import com.example.payment.dto.MoneyDto;
import com.example.payment.model.Payment;
import com.example.payment.model.PaymentStatus;
import com.example.payment.service.PaymentService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @QueryMapping
    public List<Payment> payments() {
        return paymentService.findAll();
    }

    @QueryMapping
    public Payment payment(@Argument UUID id) {
        return paymentService.findById(id);
    }

    @MutationMapping
    public Payment createPayment(@Argument CreatePaymentInput input) {
        return paymentService.create(input);
    }

    @MutationMapping
    public Payment updatePaymentStatus(@Argument UUID id, @Argument PaymentStatus status) {
        return paymentService.updateStatus(id, status);
    }

    @SchemaMapping(typeName = "Payment", field = "amount")
    public MoneyDto amount(Payment payment) {
        return new MoneyDto(payment.getAmount(), payment.getCurrency());
    }
}
