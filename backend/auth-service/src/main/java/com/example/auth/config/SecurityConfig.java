package com.example.auth.config;

import java.nio.charset.StandardCharsets;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
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

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
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
        CsrfFilter csrfFilter = new CsrfFilter(CookieCsrfTokenRepository.withHttpOnlyFalse());
        csrfFilter.setRequestHandler(new CsrfTokenRequestAttributeHandler());
        csrfFilter.setRequireCsrfProtectionMatcher(
                new AndRequestMatcher(CsrfFilter.DEFAULT_CSRF_MATCHER, new NegatedRequestMatcher(loginOrSignup)));

        http.csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(csrfFilter, BasicAuthenticationFilter.class)
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth.requestMatchers("/api/auth/login", "/api/auth/signup")
                        .permitAll()
                        .requestMatchers("/actuator/**")
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults())
                        .bearerTokenResolver(new CookieBearerTokenResolver()));
        return http.build();
    }
}
