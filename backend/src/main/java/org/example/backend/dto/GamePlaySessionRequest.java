package org.example.backend.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;

public record GamePlaySessionRequest(
        @NotBlank @Size(max = 100) @Pattern(regexp = "[\\w .-]+", message = "contains invalid characters") String gameName,
        @NotNull @Min(0) @Max(86_400) Integer totalSeconds,
        /* Optional; ignored when in the future. */
        Instant playedAt
) {
}
