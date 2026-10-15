package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "chats")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Owner of the chat. Messages are removed by the ON DELETE CASCADE foreign key. */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "chat_image_url")
    private String chatImageUrl;

    @Column(name = "chat_name", nullable = false)
    private String chatName;

    /** Whether the simulated contact in this chat is a trafficker. */
    @Column(name = "is_trafficker", nullable = false)
    private Boolean isTrafficker = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
