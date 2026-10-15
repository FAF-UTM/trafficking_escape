package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "game_play_sessions")
@Getter
@Setter
public class GamePlaySession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(name = "game_name", nullable = false, length = 100)
    private String gameName;

    @Column(name = "total_seconds", nullable = false)
    private Integer totalSeconds;

    @Column(name = "played_at", nullable = false)
    private Instant playedAt;

    @PrePersist
    void prePersist() {
        if (playedAt == null) playedAt = Instant.now();
    }
}


