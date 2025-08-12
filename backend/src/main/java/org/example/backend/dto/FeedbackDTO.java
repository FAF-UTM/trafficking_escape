package org.example.backend.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class FeedbackDTO {
    private Long id;
    private Integer experience;
    private Integer difficulty;
    private Integer awareness;
    private Integer minigames;
    private Integer recommend;
    private Integer navigation;
    private Instant createdAt;
}