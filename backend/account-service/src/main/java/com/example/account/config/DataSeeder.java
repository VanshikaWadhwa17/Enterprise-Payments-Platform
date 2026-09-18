package com.example.account.config;

import com.example.account.model.Account;
import com.example.account.model.AccountStatus;
import com.example.account.repository.AccountRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;

    @Override
    public void run(String... args) {
        if (accountRepository.count() > 0) {
            return;
        }

        accountRepository.save(
                seed("IE29AIBK93115212345678", "John Smith", AccountStatus.ACTIVE, new BigDecimal("12500.00")));
        accountRepository.save(
                seed("DE89370400440532013000", "Amazon", AccountStatus.ACTIVE, new BigDecimal("980000.00")));
        accountRepository.save(
                seed("FR1420041010050500013M02606", "Sarah Connor", AccountStatus.FROZEN, new BigDecimal("300.00")));
    }

    private Account seed(String accountNumber, String ownerName, AccountStatus status, BigDecimal balance) {
        Account account = new Account();
        account.setAccountNumber(accountNumber);
        account.setOwnerName(ownerName);
        account.setStatus(status);
        account.setBalance(balance);
        account.setCurrency("EUR");
        return account;
    }
}
