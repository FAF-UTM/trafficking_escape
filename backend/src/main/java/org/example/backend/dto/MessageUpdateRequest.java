package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MessageUpdateRequest(
        @NotNull Boolean isOutgoing,
        @NotBlank @Size(max = 4000) String messageText
) {
}
