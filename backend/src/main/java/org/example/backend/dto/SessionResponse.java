package org.example.backend.dto;

import org.example.backend.security.PlatformUserDetails;

import java.time.Instant;

/**
 * Who is signed in. The session token itself is never part of a response body; it lives in an
 * HttpOnly cookie that page scripts cannot read.
 */
public record SessionResponse(boolean authenticated, Long userId, String username, String role, Instant expiresAt) {

    public static SessionResponse anonymous() {
        return new SessionResponse(false, null, null, null, null);
    }

    public static SessionResponse of(PlatformUserDetails user, Instant expiresAt) {
        return new SessionResponse(true, user.getId(), user.getUsername(), user.getRole().name(), expiresAt);
    }
}
