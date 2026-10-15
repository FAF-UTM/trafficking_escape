package org.example.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** Star ratings from the feedback page; 0 or null means "not answered". */
public record FeedbackRequest(
        @Min(0) @Max(5) Integer experience,
        @Min(0) @Max(5) Integer difficulty,
        @Min(0) @Max(5) Integer awareness,
        @Min(0) @Max(5) Integer minigames,
        @Min(0) @Max(5) Integer recommend,
        @Min(0) @Max(5) Integer navigation
) {
}
