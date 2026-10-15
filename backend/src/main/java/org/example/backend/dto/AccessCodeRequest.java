package org.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AccessCodeRequest(
        @NotBlank @Pattern(regexp = "[A-Za-z0-9]{6}", message = "must be 6 letters or digits") String code,
        boolean oneTime
) {
}
