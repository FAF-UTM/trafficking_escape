package org.example.backend.dto;

import java.time.Instant;

/** Returned once when an ephemeral user is created; the access code is not stored in plain text. */
public record CreatedUserResponse(String username, String accessCode, Instant expirationDate) {
}
