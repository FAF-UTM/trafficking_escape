package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "chats")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Each chat is owned by a user.
    @Column(name = "user_id", nullable = false)
    private Long userId;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id", nullable = false)
//    private User user;

    // URL or path to the chat image.
    @Column(name = "chat_image_url")
    private String chatImageUrl;

    // Name or title of the chat.
    @Column(name = "chat_name", nullable = false)
    private String chatName;

    // Flag indicating if the chat is associated with trafficking.
    @Column(name = "is_trafficker", nullable = false)
    private Boolean isTrafficker = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // A chat can contain many messages.
//    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<Message> messages;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "chat_id", referencedColumnName = "id")
    private List<Message> messages;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
