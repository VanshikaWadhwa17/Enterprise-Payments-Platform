package com.example.reconciliation.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;

/**
 * Reads the access token from the httpOnly `epp_token` cookie issued by
 * auth-service, instead of an `Authorization` header -- the token is never
 * exposed to frontend JS, so there's nothing for Angular to put in a header.
 */
public class CookieBearerTokenResolver implements BearerTokenResolver {

    public static final String COOKIE_NAME = "epp_token";

    @Override
    public String resolve(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (COOKIE_NAME.equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
