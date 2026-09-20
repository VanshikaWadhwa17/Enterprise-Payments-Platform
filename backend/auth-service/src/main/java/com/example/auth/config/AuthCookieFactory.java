package com.example.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/** Builds the httpOnly `epp_token` cookie set on login/signup and cleared on logout. */
@Component
public class AuthCookieFactory {

    private final boolean secure;

    public AuthCookieFactory(@Value("${app.cookie.secure}") boolean secure) {
        this.secure = secure;
    }

    public ResponseCookie issue(String token, long maxAgeSeconds) {
        return ResponseCookie.from(CookieBearerTokenResolver.COOKIE_NAME, token)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }

    public ResponseCookie clear() {
        return ResponseCookie.from(CookieBearerTokenResolver.COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
    }
}
