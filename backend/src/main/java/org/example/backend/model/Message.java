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

    @Column(name = "chat_id", nullable = false)
    private Long chatId;

    /** True when the player sent the message, false when it came from the simulated contact. */
    @Column(name = "is_outgoing", nullable = false)
    private Boolean isOutgoing;

    @Column(name = "message_text", nullable = false)
    private String messageText;

    @Column(name = "danger_level")
    private Integer dangerLevel;

    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    @PrePersist
    void prePersist() {
        if (sentAt == null) sentAt = Instant.now();
    }
}
