package com.example.fraud;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import com.example.fraud.model.FraudCase;
import com.example.fraud.model.FraudCaseStatus;
import com.example.fraud.model.RiskLevel;
import com.example.fraud.repository.FraudCaseRepository;
import com.example.fraud.support.TestJwtSupport;
import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.servlet.client.MockMvcWebTestClient;
import org.springframework.web.context.WebApplicationContext;

/**
 * "Fraud review" in Phase F's spec means investigateFraudCase/
 * approveFraudCase -- both require FRAUD_REVIEW (FraudCaseController.java).
 * Fraud cases are normally created by a Kafka consumer reacting to payment
 * events, not by any GraphQL mutation, so this seeds one directly via the
 * repository rather than standing up the Kafka round-trip just for test
 * fixture setup.
 */
@SpringBootTest
class FraudAuthorizationTest {

    // See payment-service's PaymentAuthorizationTest for why this constant is
    // safe: CookieCsrfTokenRepository is stateless double-submit, and CSRF
    // runs before authentication, so every POST here needs it regardless of
    // whether the request is meant to succeed, be denied, or be unauthenticated.
    private static final String CSRF_TOKEN = "test-csrf-token";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private FraudCaseRepository fraudCaseRepository;

    private WebTestClient webTestClient;
    private UUID fraudCaseId;

    @BeforeEach
    void setUp() {
        webTestClient = MockMvcWebTestClient.bindToApplicationContext(webApplicationContext)
                .apply(springSecurity())
                .build();

        FraudCase fraudCase = new FraudCase();
        fraudCase.setPaymentId(UUID.randomUUID().toString());
        fraudCase.setAmount(new BigDecimal("500.00"));
        fraudCase.setCurrency("USD");
        fraudCase.setBeneficiaryName("Test");
        fraudCase.setScore(80);
        fraudCase.setRiskLevel(RiskLevel.HIGH);
        fraudCase.setFactors(List.of("velocity"));
        fraudCase.setStatus(FraudCaseStatus.OPEN);
        fraudCase.setOpenedAt(Instant.now());
        fraudCaseId = fraudCaseRepository.save(fraudCase).getId();
    }

    @AfterEach
    void tearDown() {
        fraudCaseRepository.deleteById(fraudCaseId);
    }

    @Test
    void fraudAnalystCanInvestigate() {
        Cookie fraudAnalyst = TestJwtSupport.authCookie(jwtSecret, "FRAUD_ANALYST");

        String json = graphql(
                fraudAnalyst,
                "mutation($id: ID!) { investigateFraudCase(id: $id) { id status } }",
                Map.of("id", fraudCaseId.toString()));
        String status = JsonPath.read(json, "$.data.investigateFraudCase.status");
        assertThat(status).isEqualTo("INVESTIGATING");
    }

    @Test
    void paymentAnalystCannotInvestigate() {
        Cookie paymentAnalyst = TestJwtSupport.authCookie(jwtSecret, "PAYMENT_ANALYST");

        String json = graphql(
                paymentAnalyst,
                "mutation($id: ID!) { investigateFraudCase(id: $id) { id status } }",
                Map.of("id", fraudCaseId.toString()));
        assertForbidden(json);
    }

    @Test
    void noAuthCookieGetsRawHttp401() {
        webTestClient
                .post()
                .uri("/graphql")
                .contentType(MediaType.APPLICATION_JSON)
                .cookie("XSRF-TOKEN", CSRF_TOKEN)
                .header("X-XSRF-TOKEN", CSRF_TOKEN)
                .bodyValue(Map.of("query", "{ fraudCases { id } }"))
                .exchange()
                .expectStatus()
                .isUnauthorized();
    }

    private String graphql(Cookie cookie, String query, Map<String, Object> variables) {
        byte[] body = webTestClient
                .post()
                .uri("/graphql")
                .contentType(MediaType.APPLICATION_JSON)
                .cookie(cookie.getName(), cookie.getValue())
                .cookie("XSRF-TOKEN", CSRF_TOKEN)
                .header("X-XSRF-TOKEN", CSRF_TOKEN)
                .bodyValue(Map.of("query", query, "variables", variables))
                .exchange()
                .expectStatus()
                .isOk()
                .expectBody()
                .returnResult()
                .getResponseBody();
        return new String(body, StandardCharsets.UTF_8);
    }

    private static void assertForbidden(String json) {
        String classification = JsonPath.read(json, "$.errors[0].extensions.classification");
        assertThat(classification).isEqualTo("FORBIDDEN");
    }
}
