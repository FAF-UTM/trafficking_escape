package org.example.backend.ai;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

/**
 * @param apiKey          OpenAI API key (OPENAI_API_KEY, or the older GPT_TOKEN)
 * @param baseUrl         API root, e.g. https://api.openai.com/v1
 * @param model           model id, e.g. gpt-6-luna (OPENAI_MODEL)
 * @param reasoningEffort reasoning.effort sent to the Responses API; empty to omit it
 * @param maxOutputTokens upper bound for reasoning plus visible output tokens
 * @param timeout         read timeout for one model call
 */
@Validated
@ConfigurationProperties("app.openai")
public record OpenAiProperties(
        String apiKey,
        @NotBlank String baseUrl,
        @NotBlank String model,
        String reasoningEffort,
        @Min(256) int maxOutputTokens,
        @NotNull Duration timeout
) {
}
