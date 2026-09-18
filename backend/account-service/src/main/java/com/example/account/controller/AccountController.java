package com.example.account.controller;

import com.example.account.model.Account;
import com.example.account.service.AccountService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @QueryMapping
    public List<Account> accounts() {
        return accountService.findAll();
    }

    @QueryMapping
    public Account account(@Argument UUID id) {
        return accountService.findById(id);
    }

    @QueryMapping
    public Account accountByNumber(@Argument String accountNumber) {
        return accountService.findByAccountNumber(accountNumber);
    }
}
