package com.example.auth.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Puts the authenticated user's ID into the logging MDC once JWT
 * authentication has resolved. Wired into the Security filter chain itself
 * (see {@code SecurityConfig}'s {@code addFilterAfter(...,
 * BearerTokenAuthenticationFilter.class)}) rather than registered as a
 * plain servlet filter -- the SecurityContext isn't populated until Spring
 * Security's own authentication filter runs, so a plain {@code @Component}
 * filter like {@link RequestIdFilter} (which deliberately runs outside
 * Security, before it) would run too early to see the principal.
 *
 * <p>Does not remove the MDC key itself -- {@link RequestIdFilter}'s outer
 * {@code finally { MDC.clear(); }} is the single cleanup point for the
 * whole request.
 */
public class MdcUserIdFilter extends OncePerRequestFilter {

    private static final String MDC_KEY = "userId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            MDC.put(MDC_KEY, jwt.getSubject());
        }
        chain.doFilter(request, response);
    }
}
