package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "chat_data")
public class ChatData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String from;
    private String fromImg;
    private String sendType;

    @ElementCollection
    @CollectionTable(name = "chat_messages", joinColumns = @JoinColumn(name = "chat_data_id"))
    @Column(name = "message")
    private List<String> messages;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne
    @JoinColumn(name = "chat_user_id", nullable = false)
    private ChatUsers chatUser;
}
