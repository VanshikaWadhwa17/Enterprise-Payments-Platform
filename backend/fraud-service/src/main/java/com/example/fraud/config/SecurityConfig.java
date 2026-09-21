package com.example.fraud.config;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public JwtDecoder jwtDecoder(@Value("${app.jwt.secret}") String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "app.jwt.secret (AUTH_JWT_SECRET) must be set -- see .env.example");
        }
        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    /**
     * The JWT only carries a `role` claim (see auth-service's JwtService) --
     * permissions are derived here from the same RolePermissions map used by
     * auth-service and Angular, and exposed as authorities so
     * {@code @PreAuthorize("hasAuthority('PAYMENT_CREATE')")} works directly.
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(this::authoritiesFrom);
        return converter;
    }

    private List<GrantedAuthority> authoritiesFrom(Jwt jwt) {
        String roleClaim = jwt.getClaimAsString("role");
        if (roleClaim == null) {
            return List.of();
        }
        Role role;
        try {
            role = Role.valueOf(roleClaim);
        } catch (IllegalArgumentException ex) {
            return List.of();
        }
        return RolePermissions.forRole(role).stream()
                .map(permission -> (GrantedAuthority) new SimpleGrantedAuthority(permission.name()))
                .collect(Collectors.toList());
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter converter,
            @Value("${app.cookie.secure}") boolean cookieSecure,
            @Value("${app.cookie.same-site}") String cookieSameSite)
            throws Exception {
        // Spring Security's oauth2ResourceServer() DSL auto-exempts any
        // Bearer-authenticated request from CSRF, on the assumption a bearer
        // token is manually attached via header (unforgeable cross-site).
        // Here the token rides in a cookie the browser attaches
        // automatically, so that assumption doesn't hold -- letting
        // .csrf(...) wire itself up via the DSL would silently exempt every
        // authenticated request from CSRF protection. Building CsrfFilter
        // directly (and disabling the DSL's own) sidesteps that auto-exempt
        // wiring entirely.
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        // XSRF-TOKEN must carry the same Secure/SameSite as auth-service's
        // epp_token cookie -- otherwise the browser accepts one cookie and
        // rejects the other under the exact same HTTPS/cross-site
        // conditions, breaking the CSRF check silently in production.
        csrfTokenRepository.setCookieCustomizer(
                cookie -> cookie.secure(cookieSecure).sameSite(cookieSameSite));
        CsrfFilter csrfFilter = new CsrfFilter(csrfTokenRepository);
        csrfFilter.setRequestHandler(new CsrfTokenRequestAttributeHandler());

        http.securityMatcher("/graphql", "/actuator/**")
                .csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(csrfFilter, BasicAuthenticationFilter.class)
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth.requestMatchers("/actuator/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(converter))
                        .bearerTokenResolver(new CookieBearerTokenResolver()));
        return http.build();
    }
}
