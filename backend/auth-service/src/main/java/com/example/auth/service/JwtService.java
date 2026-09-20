package com.example.auth.service;

import com.example.auth.model.AppUser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Issues the app's own JWT after a successful login/signup. Only carries
 * identity claims (sub, email, role) -- permissions are derived from role by
 * whichever service reads the token, via the shared RolePermissions map, so
 * they don't need to be duplicated into every token.
 */
@Service
public class JwtService {

    private final Key signingKey;
    private final long expirationSeconds;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-seconds}") long expirationSeconds) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "app.jwt.secret (AUTH_JWT_SECRET) must be set -- see .env.example");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationSeconds = expirationSeconds;
    }

    public String issue(AppUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationSeconds, ChronoUnit.SECONDS)))
                .signWith(signingKey)
                .compact();
    }

    public long expirationSeconds() {
        return expirationSeconds;
    }
}
