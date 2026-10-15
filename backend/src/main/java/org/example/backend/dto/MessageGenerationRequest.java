package org.example.backend.dto;

import jakarta.validation.constraints.*;

public record MessageGenerationRequest(
        /* Short scenario description; optional. */
        @Size(max = 1000) String context,
        @NotBlank @Size(max = 2000) String lastMessage,
        @NotNull @Min(-10_000) @Max(10_000) Integer currentDangerLevel,
        @NotNull Boolean isTrafficker,
        /* BCP 47 tag such as "en" or "nl"; defaults to English. */
        @Pattern(regexp = "[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8})?") String language,
        /* When set, the chat's stored messages are sent to the model as conversation history. */
        Long chatId
) {
}
