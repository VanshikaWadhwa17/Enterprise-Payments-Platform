package com.example.reconciliation;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.web.servlet.client.MockMvcWebTestClient;
import org.springframework.web.context.WebApplicationContext;

/**
 * Keeps the "no JWT -> 401" check consistent across every GraphQL service
 * this RBAC story touches (payment/fraud/reconciliation), even though
 * reconciliation-service isn't otherwise exercised by the role-based
 * scenarios in PaymentAuthorizationTest/FraudAuthorizationTest.
 */
@SpringBootTest
class ReconciliationSecurityTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Test
    void noAuthCookieGetsRawHttp401() {
        WebTestClient webTestClient = MockMvcWebTestClient.bindToApplicationContext(webApplicationContext)
                .apply(springSecurity())
                .build();

        // CSRF is stateless double-submit (see PaymentAuthorizationTest for the
        // full explanation) and runs before authentication, so it must still be
        // satisfied here even though this cookie/header pair carries no identity.
        webTestClient
                .post()
                .uri("/graphql")
                .contentType(MediaType.APPLICATION_JSON)
                .cookie("XSRF-TOKEN", "test-csrf-token")
                .header("X-XSRF-TOKEN", "test-csrf-token")
                .bodyValue(Map.of("query", "{ reconciliationRecords { id } }"))
                .exchange()
                .expectStatus()
                .isUnauthorized();
    }
}
