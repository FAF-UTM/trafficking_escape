package org.example.backend.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * @param sessionName cookie holding the JWT (HttpOnly)
 * @param csrfName    cookie holding the CSRF secret (HttpOnly; the SPA gets the token from /api/v1/auth/csrf)
 * @param secure      send cookies over HTTPS only; browsers also accept Secure cookies on http://localhost
 * @param sameSite    Strict when frontend and API share a site (recommended), Lax or None otherwise
 * @param domain      optional Domain attribute, e.g. "traffickingescape.com" to share across subdomains
 */
@Validated
@ConfigurationProperties("app.security.cookie")
public record AuthCookieProperties(
        @NotBlank String sessionName,
        @NotBlank String csrfName,
        boolean secure,
        @Pattern(regexp = "Strict|Lax|None") String sameSite,
        String domain
) {
}
