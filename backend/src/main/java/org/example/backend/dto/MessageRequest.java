package org.example.backend.dto;

import jakarta.validation.constraints.*;

public record MessageRequest(
        @NotNull Long chatId,
        @NotNull Boolean isOutgoing,
        @NotBlank @Size(max = 4000) String messageText,
        @Min(-10) @Max(10) Integer dangerLevel
) {
}
