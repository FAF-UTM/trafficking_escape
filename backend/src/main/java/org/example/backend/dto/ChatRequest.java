package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @Size(max = 255) @Pattern(regexp = "(https://|/)\\S*", message = "must be an https URL or an absolute path")
        String chatImageUrl,
        @NotBlank @Size(max = 255) String chatName,
        @NotNull Boolean isTrafficker
) {
}
