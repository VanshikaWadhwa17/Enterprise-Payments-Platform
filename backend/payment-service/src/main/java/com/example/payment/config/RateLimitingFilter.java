package com.example.payment.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Fixed-window rate limiter backed by a Redis counter, keyed by client IP
 * and the current one-minute window. This is a demonstration of using Redis
 * for rate limiting -- not a production-grade sliding-window implementation.
 */
@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int REQUESTS_PER_MINUTE = 60;

    private final StringRedisTemplate redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!"/graphql".equals(request.getRequestURI())) {
            chain.doFilter(request, response);
            return;
        }

        String redisKey = "ratelimit:%s:%d".formatted(request.getRemoteAddr(), Instant.now().getEpochSecond() / 60);
        Long count = redisTemplate.opsForValue().increment(redisKey);
        if (count != null && count == 1L) {
            redisTemplate.expire(redisKey, Duration.ofMinutes(2));
        }

        if (count != null && count > REQUESTS_PER_MINUTE) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests\"}");
            return;
        }

        chain.doFilter(request, response);
    }
}
