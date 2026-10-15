package org.example.backend.model;

/** Stored as-is in app_user.role and used directly as the Spring Security authority. */
public enum Role {
    ROLE_USER,
    ROLE_ADMIN
}
