package com.example.auth.config;

import com.example.auth.model.Role;
import com.example.auth.model.RolePermissions;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;
import javax.crypto.spec.SecretKeySpec;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.AndRequestMatcher;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtDecoder jwtDecoder(@Value("${app.jwt.secret}") String secret) {
        SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(key).build();
    }

    /**
     * The JWT only carries a `role` claim (see JwtService) -- permissions are
     * derived here from the same RolePermissions map used by payment/fraud/
     * reconciliation-service and Angular, and exposed as authorities so
     * {@code @PreAuthorize("hasAuthority('USER_VIEW')")} works directly on
     * the new user-management endpoints.
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
        // Built manually (not via the .csrf(...) DSL) so we control
        // requireCsrfProtectionMatcher directly. Going through the DSL here
        // would let oauth2ResourceServer() silently exempt every
        // Bearer-authenticated request from CSRF -- correct for the
        // conventional header-delivered bearer token, wrong here since the
        // token rides in a cookie the browser attaches automatically (see
        // payment-service's SecurityConfig for the full explanation).
        RequestMatcher loginOrSignup = new OrRequestMatcher(
                PathPatternRequestMatcher.pathPattern(HttpMethod.POST, "/api/auth/login"),
                PathPatternRequestMatcher.pathPattern(HttpMethod.POST, "/api/auth/signup"));
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        // XSRF-TOKEN must carry the same Secure/SameSite as the epp_token
        // cookie (AuthCookieFactory) -- otherwise the browser accepts one
        // cookie and rejects the other under the exact same HTTPS/cross-site
        // conditions, breaking the CSRF check silently in production.
        csrfTokenRepository.setCookieCustomizer(
                cookie -> cookie.secure(cookieSecure).sameSite(cookieSameSite));
        CsrfFilter csrfFilter = new CsrfFilter(csrfTokenRepository);
        csrfFilter.setRequestHandler(new CsrfTokenRequestAttributeHandler());
        csrfFilter.setRequireCsrfProtectionMatcher(
                new AndRequestMatcher(CsrfFilter.DEFAULT_CSRF_MATCHER, new NegatedRequestMatcher(loginOrSignup)));

        http.csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(csrfFilter, BasicAuthenticationFilter.class)
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                // MDC userId is only knowable once the resource server's own
                // filter has resolved the JWT -- see MdcUserIdFilter's javadoc.
                .addFilterAfter(new MdcUserIdFilter(), BearerTokenAuthenticationFilter.class)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth.requestMatchers("/api/auth/login", "/api/auth/signup")
                        .permitAll()
                        .requestMatchers("/actuator/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(converter))
                        .bearerTokenResolver(new CookieBearerTokenResolver()))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            log.warn("event=AuthorizationDenied type=UNAUTHENTICATED path={}", request.getRequestURI());
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            log.warn("event=AuthorizationDenied type=FORBIDDEN path={}", request.getRequestURI());
                            response.sendError(HttpServletResponse.SC_FORBIDDEN);
                        }));
        return http.build();
    }
}
