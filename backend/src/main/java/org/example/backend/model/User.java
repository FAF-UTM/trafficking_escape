package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "app_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* Core auth fields */
    @Column(name = "username", nullable = false, unique = true, length = 120)
    private String username;

    @Column(name = "password", nullable = false, length = 200)
    private String password;

    @Column(name = "role", nullable = false, length = 40)
    private String role; // e.g. ROLE_ADMIN / ROLE_USER

    @Column(name = "created_by", length = 120)
    private String createdBy; // admin username that created this user

    /* Ephemeral access code support */
    @Column(name = "expiration_date")
    private Instant expirationDate;

    @Column(name = "access_code_hash", length = 200)
    private String accessCodeHash; // BCrypt hash (may be null if code invalidated)

    @Column(name = "access_code_sha256", length = 64, unique = true)
    private String accessCodeSha256; // deterministic lookup (hex) – can be null after invalidation

    /* Other fields */
    @Column(name = "email", nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    /* Example relation (leave if you really use it) */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private List<Chat> chats;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
