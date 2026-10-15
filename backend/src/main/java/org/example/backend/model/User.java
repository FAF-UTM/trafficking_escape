package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 120)
    private String username;

    @Column(name = "password", nullable = false, length = 200)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 40)
    private Role role;

    /** Username of the admin that created this user. */
    @Column(name = "created_by", length = 120)
    private String createdBy;

    /** Set for ephemeral (access-code) users; null means the account never expires. */
    @Column(name = "expiration_date")
    private Instant expirationDate;

    /** BCrypt hash of the access code; null once a one-time code has been used. */
    @Column(name = "access_code_hash", length = 200)
    private String accessCodeHash;

    /** SHA-256 hex of the access code, used for the indexed lookup. */
    @Column(name = "access_code_sha256", length = 64, unique = true)
    private String accessCodeSha256;

    @Column(name = "email", nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public boolean isExpired(Instant now) {
        return expirationDate != null && !expirationDate.isAfter(now);
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
