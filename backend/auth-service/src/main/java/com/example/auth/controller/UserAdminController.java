package com.example.auth.controller;

import com.example.auth.dto.UpdateUserRoleRequest;
import com.example.auth.dto.UpdateUserStatusRequest;
import com.example.auth.dto.UserResponse;
import com.example.auth.model.AppUser;
import com.example.auth.service.AuthService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/users")
@RequiredArgsConstructor
public class UserAdminController {

    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public List<UserResponse> listUsers() {
        return authService.listUsers().stream().map(UserResponse::from).toList();
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public UserResponse updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        AppUser user = authService.updateRole(id, request.role(), UUID.fromString(jwt.getSubject()));
        return UserResponse.from(user);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public UserResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        AppUser user = authService.updateStatus(id, request.enabled(), UUID.fromString(jwt.getSubject()));
        return UserResponse.from(user);
    }
}
