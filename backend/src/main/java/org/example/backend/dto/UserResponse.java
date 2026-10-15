package org.example.backend.dto;

import org.example.backend.model.User;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        String email,
        String role,
        String createdBy,
        Instant expirationDate,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole().name(),
                user.getCreatedBy(), user.getExpirationDate(), user.getCreatedAt());
    }
}
