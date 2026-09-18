package com.example.payment.service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Prevents duplicate payment creation when a client retries the same
 * request (e.g. after a timeout) by remembering which idempotency key
 * produced which payment.
 */
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private static final Duration TTL = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;

    public Optional<UUID> findExisting(String idempotencyKey) {
        String value = redisTemplate.opsForValue().get(redisKey(idempotencyKey));
        return Optional.ofNullable(value).map(UUID::fromString);
    }

    public void record(String idempotencyKey, UUID paymentId) {
        redisTemplate.opsForValue().set(redisKey(idempotencyKey), paymentId.toString(), TTL);
    }

    private String redisKey(String idempotencyKey) {
        return "idempotency:payment:" + idempotencyKey;
    }
}
