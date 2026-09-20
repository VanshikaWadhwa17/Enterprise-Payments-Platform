package com.example.auth.controller;

import com.example.auth.config.AuthCookieFactory;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.SignupRequest;
import com.example.auth.dto.UserResponse;
import com.example.auth.model.AppUser;
import com.example.auth.service.AuthService;
import com.example.auth.service.JwtService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final AuthCookieFactory cookieFactory;

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(@Valid @RequestBody SignupRequest request) {
        AppUser user = authService.signup(request);
        return withAuthCookie(user);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        AppUser user = authService.login(request);
        return withAuthCookie(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookieFactory.clear().toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal Jwt jwt) {
        AppUser user = authService.findById(UUID.fromString(jwt.getSubject()));
        return ResponseEntity.ok(UserResponse.from(user));
    }

    private ResponseEntity<UserResponse> withAuthCookie(AppUser user) {
        String token = jwtService.issue(user);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookieFactory.issue(token, jwtService.expirationSeconds()).toString())
                .body(UserResponse.from(user));
    }
}
