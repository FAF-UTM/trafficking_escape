package org.example.backend.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String password;
    private String role; // ROLE_ADMIN or ROLE_USER
}
