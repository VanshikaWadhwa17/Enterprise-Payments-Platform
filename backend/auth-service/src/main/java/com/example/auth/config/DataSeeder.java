package com.example.auth.config;

import com.example.auth.model.AppUser;
import com.example.auth.model.Role;
import com.example.auth.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds one demo user per role for local development. All five share the
 * password "Passw0rd!" -- documented in the service README, not a secret
 * worth protecting since this only ever runs against the local dev database.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final String DEMO_PASSWORD = "Passw0rd!";

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (appUserRepository.count() > 0) {
            return;
        }

        seed("Alice Payments", "alice@epp.dev", Role.PAYMENT_ANALYST);
        seed("Bob Operations", "bob@epp.dev", Role.OPERATIONS_MANAGER);
        seed("Carol Admin", "carol@epp.dev", Role.ADMIN);
        seed("Dan Fraud", "dan@epp.dev", Role.FRAUD_ANALYST);
        seed("Erin Viewer", "erin@epp.dev", Role.VIEWER);
    }

    private void seed(String fullName, String email, Role role) {
        AppUser user = new AppUser();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        user.setRole(role);
        appUserRepository.save(user);
    }
}
