package com.example.auth.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "app_users")
@Getter
@Setter
@NoArgsConstructor
public class AppUser implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // columnDefinition forces a DEFAULT clause into the generated DDL --
    // without it, Hibernate's ddl-auto=update emits a bare
    // `ADD COLUMN enabled boolean not null`, which Postgres rejects outright
    // against a table that already has rows (verified against the real
    // docker-compose Postgres, which already has DataSeeder's demo users).
    @Column(nullable = false, columnDefinition = "boolean not null default true")
    private boolean enabled = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
