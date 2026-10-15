package org.example.backend.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * Reads the JWT from the HttpOnly session cookie only. Authorization headers are ignored, so a
 * token can never be supplied by page scripts.
 *
 * <p>Sign-in, sign-out and session endpoints are skipped: a stale cookie there must not turn the
 * request into a 401 and lock the user out of signing in again.
 */
public class CookieBearerTokenResolver implements BearerTokenResolver {

    static final RequestMatcher SKIPPED = new OrRequestMatcher(
            PathPatternRequestMatcher.withDefaults().matcher("/api/v1/users/token"),
            PathPatternRequestMatcher.withDefaults().matcher("/api/v1/users/access-code"),
            PathPatternRequestMatcher.withDefaults().matcher("/api/v1/auth/**"));

    private final String cookieName;

    public CookieBearerTokenResolver(String cookieName) {
        this.cookieName = cookieName;
    }

    @Override
    public String resolve(HttpServletRequest request) {
        if (SKIPPED.matches(request) || request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
