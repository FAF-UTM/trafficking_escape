package org.example.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

/** Builds the session cookie. Its lifetime matches the token's, so the browser drops it when the token expires. */
@Component
@RequiredArgsConstructor
public class AuthCookies {

    private final AuthCookieProperties properties;
    private final Clock clock;

    public ResponseCookie session(String token, Instant expiresAt) {
        Duration maxAge = Duration.between(clock.instant(), expiresAt);
        return base(token).maxAge(maxAge.isNegative() ? Duration.ZERO : maxAge).build();
    }

    public ResponseCookie clearedSession() {
        return base("").maxAge(Duration.ZERO).build();
    }

    public String sessionName() {
        return properties.sessionName();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(properties.sessionName(), value)
                .httpOnly(true)
                .secure(properties.secure())
                .sameSite(properties.sameSite())
                .path("/");
        if (StringUtils.hasText(properties.domain())) {
            builder.domain(properties.domain());
        }
        return builder;
    }
}
