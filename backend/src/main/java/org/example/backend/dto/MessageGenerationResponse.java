package org.example.backend.dto;

/** Field names are what the frontend chat (Chat.tsx) reads. */
public record MessageGenerationResponse(
        String chatResponse,
        String option1,
        int dangerLevel1,
        String option2,
        int dangerLevel2,
        String option3,
        int dangerLevel3,
        int updatedDangerLevel,
        boolean isTrafficker,
        String language
) {
}
