package com.example.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import com.example.payment.repository.PaymentRepository;
import com.example.payment.support.TestJwtSupport;
import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
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
 * Exercises the real Spring Security filter chain (MockMvcWebTestClient +
 * springSecurity()) with JWTs minted in-test via TestJwtSupport -- no call
 * to auth-service, matching how payment-service actually validates tokens
 * at runtime (locally, via its own JwtDecoder + the shared secret).
 *
 * Expected shapes, confirmed from SecurityConfig: with CSRF satisfied (see
 * CSRF_TOKEN below), no auth cookie fails at the oauth2ResourceServer entry
 * point (raw HTTP 401). A valid cookie but a denied @PreAuthorize check
 * still returns HTTP 200 with a GraphQL error (classification FORBIDDEN) --
 * GraphQL-over-HTTP doesn't use HTTP status for authorization failures.
 */
@SpringBootTest
class PaymentAuthorizationTest {

    // CookieCsrfTokenRepository is stateless (double-submit): it validates by
    // comparing the XSRF-TOKEN cookie against the X-XSRF-TOKEN header on the
    // SAME request, with no server-side lookup -- any value works as long as
    // cookie and header match, so a fixed constant is fine here. Discovered
    // empirically: CsrfFilter runs before the oauth2ResourceServer filter
    // (addFilterBefore(csrfFilter, BasicAuthenticationFilter.class)), so a
    // request missing CSRF fails with 403 before authentication is even
    // evaluated -- every POST below needs this pair, including the
    // deliberately-unauthenticated one, or it never reaches the 401 case.
    private static final String CSRF_TOKEN = "test-csrf-token";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PaymentRepository paymentRepository;

    private WebTestClient webTestClient;
    private final List<UUID> createdPaymentIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        webTestClient = MockMvcWebTestClient.bindToApplicationContext(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @AfterEach
    void tearDown() {
        createdPaymentIds.forEach(paymentRepository::deleteById);
    }

    @Test
    void paymentAnalystCanCreateButNotApprove() {
        Cookie analyst = TestJwtSupport.authCookie(jwtSecret, "PAYMENT_ANALYST");

        String createJson = graphql(
                analyst,
                "mutation($i: CreatePaymentInput!) { createPayment(input: $i) { id status } }",
                Map.of(
                        "i",
                        Map.of(
                                "amount", 100,
                                "currency", "USD",
                                "beneficiaryName", "Test",
                                "beneficiaryAccountNumber", "12345",
                                "beneficiaryCountry", "US")));
        String paymentId = JsonPath.read(createJson, "$.data.createPayment.id");
        assertThat(paymentId).isNotBlank();
        createdPaymentIds.add(UUID.fromString(paymentId));

        String approveJson = graphql(
                analyst,
                "mutation($id: ID!) { updatePaymentStatus(id: $id, status: APPROVED) { id status } }",
                Map.of("id", paymentId));
        assertForbidden(approveJson);
    }

    @Test
    void operationsManagerCanApprove() {
        Cookie analyst = TestJwtSupport.authCookie(jwtSecret, "PAYMENT_ANALYST");
        String createJson = graphql(
                analyst,
                "mutation($i: CreatePaymentInput!) { createPayment(input: $i) { id status } }",
                Map.of(
                        "i",
                        Map.of(
                                "amount", 250,
                                "currency", "EUR",
                                "beneficiaryName", "Test",
                                "beneficiaryAccountNumber", "67890",
                                "beneficiaryCountry", "IE")));
        String paymentId = JsonPath.read(createJson, "$.data.createPayment.id");
        createdPaymentIds.add(UUID.fromString(paymentId));

        Cookie manager = TestJwtSupport.authCookie(jwtSecret, "OPERATIONS_MANAGER");
        String approveJson = graphql(
                manager,
                "mutation($id: ID!) { updatePaymentStatus(id: $id, status: APPROVED) { id status } }",
                Map.of("id", paymentId));
        String status = JsonPath.read(approveJson, "$.data.updatePaymentStatus.status");
        assertThat(status).isEqualTo("APPROVED");
    }

    @Test
    void fraudAnalystCannotApprovePayments() {
        Cookie fraudAnalyst = TestJwtSupport.authCookie(jwtSecret, "FRAUD_ANALYST");

        String json = graphql(
                fraudAnalyst,
                "mutation($id: ID!) { updatePaymentStatus(id: $id, status: APPROVED) { id status } }",
                Map.of("id", UUID.randomUUID().toString()));
        assertForbidden(json);
    }

    @Test
    void noAuthCookieGetsRawHttp401() {
        // CSRF must still pass (see CSRF_TOKEN javadoc above) so this actually
        // reaches the authentication check rather than failing CSRF first.
        webTestClient
                .post()
                .uri("/graphql")
                .contentType(MediaType.APPLICATION_JSON)
                .cookie("XSRF-TOKEN", CSRF_TOKEN)
                .header("X-XSRF-TOKEN", CSRF_TOKEN)
                .bodyValue(Map.of("query", "{ payments { id } }"))
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
