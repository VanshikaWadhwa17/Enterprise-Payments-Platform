package com.example.fraud.support;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.http.Cookie;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Mints an `epp_token` cookie identical in shape to auth-service's
 * JwtService (sub/email/role, HS256) -- fraud-service never calls
 * auth-service at runtime, it validates JWTs locally via its own JwtDecoder
 * against the shared AUTH_JWT_SECRET, so tests do the same rather than
 * standing up a second service just to get a token.
 */
public final class TestJwtSupport {

    private TestJwtSupport() {}

    public static Cookie authCookie(String secret, String role) {
        try {
            JWSSigner signer = new MACSigner(secret.getBytes(StandardCharsets.UTF_8));
            Instant now = Instant.now();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(UUID.randomUUID().toString())
                    .claim("email", "test-" + role.toLowerCase() + "@example.com")
                    .claim("role", role)
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plusSeconds(3600)))
                    .build();
            SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            jwt.sign(signer);
            return new Cookie("epp_token", jwt.serialize());
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to mint test JWT", ex);
        }
    }
}
