package com.example.auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Puts a request ID into the logging MDC for the lifetime of each request,
 * so every log line emitted while handling it can be correlated. Accepts an
 * inbound X-Request-Id header (e.g. forwarded by a gateway/caller) or
 * generates one.
 *
 * <p>This filter runs outermost (before Spring Security), so it's also the
 * single place the MDC gets cleared for the request -- {@link
 * MdcUserIdFilter} sets {@code userId} once authentication has resolved
 * further down the chain, but relies on this filter's {@code finally} block
 * to clear it, since it runs first and last around everything nested inside
 * it (including Security's own filters). A single clear point avoids MDC
 * leaking onto the next request handled by the same pooled thread.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Request-Id";
    private static final String MDC_KEY = "requestId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String requestId = request.getHeader(HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }

        MDC.put(MDC_KEY, requestId);
        response.setHeader(HEADER, requestId);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
