package org.example.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@Table(name = "feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "experience")
    private Integer experience;

    @Column(name = "difficulty")
    private Integer difficulty;

    @Column(name = "awareness")
    private Integer awareness;

    @Column(name = "minigames")
    private Integer minigames;

    @Column(name = "recommend")
    private Integer recommend;

    @Column(name = "navigation")
    private Integer navigation;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}