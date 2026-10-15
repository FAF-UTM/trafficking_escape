package org.example.backend.security;

import lombok.Getter;
import org.example.backend.model.Role;
import org.springframework.security.core.AuthenticatedPrincipal;

/** The authenticated user, built from the claims of a verified JWT. */
@Getter
public class PlatformUserDetails implements AuthenticatedPrincipal {

    private final Long id;
    private final String username;
    private final Role role;

    public PlatformUserDetails(Long id, String username, Role role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public boolean isAdmin() {
        return role == Role.ROLE_ADMIN;
    }

    @Override
    public String getName() {
        return username;
    }
}
