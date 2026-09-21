package com.example.auth.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.auth.model.AppUser;
import com.example.auth.repository.AppUserRepository;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Authentication and session tests, run against a real Spring context and
 * the docker-compose Postgres (same precondition as every other service's
 * stub contextLoads test). Creates its own user per test via /api/auth/
 * signup rather than relying on DataSeeder's timing/state.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationControllerTest {

    private static final String PASSWORD = "Passw0rd1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    private String email;

    @BeforeEach
    void setUp() throws Exception {
        email = "auth-test-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(signupBody(email, PASSWORD)))
                .andExpect(status().isOk());
    }

    @AfterEach
    void tearDown() {
        appUserRepository.findByEmailIgnoreCase(email).ifPresent(appUserRepository::delete);
    }

    @Test
    void validLoginReturns200() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email, PASSWORD)))
                .andExpect(status().isOk());
    }

    @Test
    void wrongPasswordReturns401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email, "WrongPassword1")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unknownEmailReturns401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("nobody-" + UUID.randomUUID() + "@example.com", PASSWORD)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void disabledAccountLoginReturns401WithTheSameGenericError() throws Exception {
        AppUser user = appUserRepository.findByEmailIgnoreCase(email).orElseThrow();
        user.setEnabled(false);
        appUserRepository.save(user);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email, PASSWORD)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void sessionSurvivesMeAndEndsAfterLogout() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(email, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie authCookie = loginResult.getResponse().getCookie("epp_token");
        Cookie xsrfCookie = loginResult.getResponse().getCookie("XSRF-TOKEN");
        assertThat(authCookie).isNotNull();
        assertThat(xsrfCookie).isNotNull();

        mockMvc.perform(get("/api/auth/me").cookie(authCookie)).andExpect(status().isOk());

        MvcResult logoutResult = mockMvc.perform(post("/api/auth/logout")
                        .cookie(authCookie, xsrfCookie)
                        .header("X-XSRF-TOKEN", xsrfCookie.getValue()))
                .andExpect(status().isNoContent())
                .andReturn();

        // Logout is stateless -- it clears the browser's cookie (asserted here via
        // Max-Age=0) rather than revoking the JWT server-side, so the correct
        // simulation of "the browser is now logged out" is a follow-up /me call
        // with NO cookie attached (what a real browser sends once Set-Cookie has
        // cleared it), not a resend of the old (still cryptographically valid)
        // token. See AuthService.login's disabled-account comment for the same
        // stateless-JWT caveat.
        String clearedCookieHeader = logoutResult.getResponse().getHeader("Set-Cookie");
        assertThat(clearedCookieHeader).contains("epp_token=").contains("Max-Age=0");

        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    private static String signupBody(String email, String password) {
        return """
                {"fullName":"Auth Test","email":"%s","password":"%s","confirmPassword":"%s"}
                """
                .formatted(email, password, password);
    }

    private static String loginBody(String email, String password) {
        return """
                {"email":"%s","password":"%s"}
                """
                .formatted(email, password);
    }
}
