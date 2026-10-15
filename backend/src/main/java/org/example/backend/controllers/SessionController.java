package org.example.backend.controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.CsrfResponse;
import org.example.backend.dto.SessionResponse;
import org.example.backend.security.AuthCookies;
import org.example.backend.security.PlatformJwtAuthenticationConverter;
import org.example.backend.security.PlatformUserDetails;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Session endpoints for the SPA, which cannot read its own HttpOnly cookies:
 * who is signed in, the CSRF token, and sign-out.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class SessionController {

    private static final PlatformJwtAuthenticationConverter CONVERTER = new PlatformJwtAuthenticationConverter();

    private final JwtDecoder jwtDecoder;
    private final AuthCookies authCookies;

    /** The token to send in the X-XSRF-TOKEN header; reading it also sets the CSRF cookie if missing. */
    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getHeaderName(), token.getToken());
    }

    /** Never fails: an invalid or expired cookie is cleared and reported as signed out. */
    @GetMapping("/session")
    public ResponseEntity<SessionResponse> session(HttpServletRequest request) {
        String token = readSessionCookie(request);
        if (token == null) {
            return ResponseEntity.ok(SessionResponse.anonymous());
        }
        try {
            Jwt jwt = jwtDecoder.decode(token);
            PlatformUserDetails user = (PlatformUserDetails) CONVERTER.convert(jwt).getPrincipal();
            return ResponseEntity.ok(SessionResponse.of(user, jwt.getExpiresAt()));
        } catch (JwtException | AuthenticationException e) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, authCookies.clearedSession().toString())
                    .body(SessionResponse.anonymous());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authCookies.clearedSession().toString())
                .build();
    }

    private String readSessionCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (authCookies.sessionName().equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
