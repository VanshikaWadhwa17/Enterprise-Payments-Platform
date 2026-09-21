package com.example.auth.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.auth.model.AppUser;
import com.example.auth.model.Role;
import com.example.auth.repository.AppUserRepository;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Proves each of USER_VIEW/ROLE_MANAGE/USER_MANAGE is independently
 * required. Note: in the current RolePermissions map, ADMIN is the only role
 * holding any of these three permissions, and it holds all three together --
 * there is no role with e.g. ROLE_MANAGE but not USER_VIEW, so the "no X"
 * cases below use a non-admin role (which has none of the three) rather than
 * a role with a different single admin permission.
 */
@SpringBootTest
@AutoConfigureMockMvc
class UserAdminControllerTest {

    private static final String PASSWORD = "Passw0rd1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    private String adminEmail;
    private String nonAdminEmail;
    private String targetEmail;
    private UUID targetId;

    @BeforeEach
    void setUp() throws Exception {
        adminEmail = signupAndElevate("admin", Role.ADMIN);
        nonAdminEmail = signupAndElevate("non-admin", Role.VIEWER);
        targetEmail = signupAndElevate("target", Role.VIEWER);
        targetId = appUserRepository.findByEmailIgnoreCase(targetEmail).orElseThrow().getId();
    }

    @AfterEach
    void tearDown() {
        appUserRepository.findByEmailIgnoreCase(adminEmail).ifPresent(appUserRepository::delete);
        appUserRepository.findByEmailIgnoreCase(nonAdminEmail).ifPresent(appUserRepository::delete);
        appUserRepository.findByEmailIgnoreCase(targetEmail).ifPresent(appUserRepository::delete);
    }

    @Test
    void listUsersRequiresUserView() throws Exception {
        Session admin = login(adminEmail);
        mockMvc.perform(get("/api/auth/users").cookie(admin.authCookie())).andExpect(status().isOk());

        Session nonAdmin = login(nonAdminEmail);
        mockMvc.perform(get("/api/auth/users").cookie(nonAdmin.authCookie())).andExpect(status().isForbidden());
    }

    @Test
    void roleChangeRequiresRoleManageAndPersists() throws Exception {
        Session admin = login(adminEmail);

        mockMvc.perform(patchWithCsrf("/api/auth/users/" + targetId + "/role", admin)
                        .content("{\"role\":\"PAYMENT_ANALYST\"}"))
                .andExpect(status().isOk());

        AppUser updated = appUserRepository.findById(targetId).orElseThrow();
        assertThat(updated.getRole()).isEqualTo(Role.PAYMENT_ANALYST);

        Session nonAdmin = login(nonAdminEmail);
        mockMvc.perform(patchWithCsrf("/api/auth/users/" + targetId + "/role", nonAdmin)
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void statusChangeRequiresUserManageAndPersists() throws Exception {
        Session admin = login(adminEmail);

        mockMvc.perform(patchWithCsrf("/api/auth/users/" + targetId + "/status", admin)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isOk());

        AppUser updated = appUserRepository.findById(targetId).orElseThrow();
        assertThat(updated.isEnabled()).isFalse();

        Session nonAdmin = login(nonAdminEmail);
        mockMvc.perform(patchWithCsrf("/api/auth/users/" + targetId + "/status", nonAdmin)
                        .content("{\"enabled\":true}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCannotChangeOwnRole() throws Exception {
        Session admin = login(adminEmail);
        UUID adminId = appUserRepository.findByEmailIgnoreCase(adminEmail).orElseThrow().getId();

        mockMvc.perform(patchWithCsrf("/api/auth/users/" + adminId + "/role", admin)
                        .content("{\"role\":\"VIEWER\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminCannotDisableOwnAccount() throws Exception {
        Session admin = login(adminEmail);
        UUID adminId = appUserRepository.findByEmailIgnoreCase(adminEmail).orElseThrow().getId();

        mockMvc.perform(patchWithCsrf("/api/auth/users/" + adminId + "/status", admin)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isBadRequest());
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder patchWithCsrf(
            String url, Session session) {
        return patch(url)
                .contentType(MediaType.APPLICATION_JSON)
                .cookie(session.authCookie(), session.xsrfCookie())
                .header("X-XSRF-TOKEN", session.xsrfCookie().getValue());
    }

    private String signupAndElevate(String label, Role role) throws Exception {
        String email = label + "-" + UUID.randomUUID() + "@example.com";
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                                """
                                {"fullName":"%s","email":"%s","password":"%s","confirmPassword":"%s"}
                                """
                                        .formatted(label, email, PASSWORD, PASSWORD)))
                .andExpect(status().isOk());

        AppUser user = appUserRepository.findByEmailIgnoreCase(email).orElseThrow();
        user.setRole(role);
        appUserRepository.save(user);
        return email;
    }

    private Session login(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();
        return new Session(result.getResponse().getCookie("epp_token"), result.getResponse().getCookie("XSRF-TOKEN"));
    }

    private record Session(Cookie authCookie, Cookie xsrfCookie) {}
}
