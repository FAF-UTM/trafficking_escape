package org.example.backend.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

/**
 * @param secret HMAC-SHA256 signing key; at least 32 characters (256 bits). Supplied via JWT_SECRET.
 * @param issuer value of the "iss" claim, checked on every request
 * @param ttl    lifetime of issued tokens
 */
@Validated
@ConfigurationProperties("app.security.jwt")
public record JwtProperties(
        @NotBlank @Size(min = 32, message = "must be at least 32 characters; set JWT_SECRET") String secret,
        @NotBlank String issuer,
        @NotNull Duration ttl
) {
}
