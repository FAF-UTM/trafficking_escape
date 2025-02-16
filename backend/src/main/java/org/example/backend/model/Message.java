package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Each message belongs to a chat.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    // Indicates if the message is outgoing (sent by the logged-in user).
    @Column(name = "is_outgoing", nullable = false)
    private Boolean isOutgoing;

    // The text content of the message.
    @Column(name = "message_text", nullable = false)
    private String messageText;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    @PrePersist
    public void prePersist() {
        sentAt = Instant.now();
    }
}
