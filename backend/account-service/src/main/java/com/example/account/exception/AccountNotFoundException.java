package com.example.account.exception;

import java.util.UUID;

public class AccountNotFoundException extends RuntimeException {

    public AccountNotFoundException(UUID id) {
        super("Account not found: " + id);
    }

    public AccountNotFoundException(String accountNumber) {
        super("Account not found: " + accountNumber);
    }
}
