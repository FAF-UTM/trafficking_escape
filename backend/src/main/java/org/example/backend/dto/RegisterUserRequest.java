package org.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.example.backend.model.Role;

public record RegisterUserRequest(
        @NotBlank @Size(min = 3, max = 120) @Pattern(regexp = "[A-Za-z0-9._-]+", message = "may only contain letters, digits, '.', '_' and '-'")
        String username,
        @NotBlank @Size(min = 12, max = 128) String password,
        @NotBlank @Email @Size(max = 180) String email,
        /* Defaults to ROLE_USER when omitted. */
        Role role
) {
}
