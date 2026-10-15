package org.example.backend.dto;

import org.example.backend.model.User;

import java.time.Instant;

public record CreatedUserSummary(String username, Instant expirationDate) {
    public static CreatedUserSummary from(User user) {
        return new CreatedUserSummary(user.getUsername(), user.getExpirationDate());
    }
}
