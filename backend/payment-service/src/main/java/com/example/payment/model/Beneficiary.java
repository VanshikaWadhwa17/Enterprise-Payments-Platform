package com.example.payment.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Beneficiary {

    @Column(name = "beneficiary_name", nullable = false)
    private String name;

    @Column(name = "beneficiary_account_number", nullable = false)
    private String accountNumber;

    @Column(name = "beneficiary_country", nullable = false)
    private String country;
}
