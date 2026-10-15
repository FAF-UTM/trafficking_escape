package org.example.backend.dto;

import org.example.backend.model.Feedback;

import java.time.Instant;

public record FeedbackResponse(
        Long id,
        Integer experience,
        Integer difficulty,
        Integer awareness,
        Integer minigames,
        Integer recommend,
        Integer navigation,
        Instant createdAt
) {
    public static FeedbackResponse from(Feedback f) {
        return new FeedbackResponse(f.getId(), f.getExperience(), f.getDifficulty(), f.getAwareness(),
                f.getMinigames(), f.getRecommend(), f.getNavigation(), f.getCreatedAt());
    }
}
