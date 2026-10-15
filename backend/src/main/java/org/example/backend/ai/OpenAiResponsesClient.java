package org.example.backend.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.exceptions.AiServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Minimal client for OpenAI's Responses API (POST /responses) with JSON-schema structured output. */
@Slf4j
@Component
public class OpenAiResponsesClient {

    private final RestClient restClient;
    private final OpenAiProperties properties;

    @Autowired
    public OpenAiResponsesClient(RestClient.Builder builder, OpenAiProperties properties) {
        this(builder
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory(properties.timeout()))
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.apiKey())
                .build(), properties);
    }

    /** {@code restClient} must already carry the base URL and Authorization header. */
    OpenAiResponsesClient(RestClient restClient, OpenAiProperties properties) {
        this.restClient = restClient;
        this.properties = properties;
        if (!StringUtils.hasText(properties.apiKey())) {
            log.warn("No OpenAI API key configured (OPENAI_API_KEY); chat generation will be unavailable");
        }
    }

    private static JdkClientHttpRequestFactory requestFactory(Duration readTimeout) {
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build());
        factory.setReadTimeout(readTimeout);
        return factory;
    }

    /**
     * Sends one request and returns the model's output text, which is guaranteed by the API
     * to be JSON matching {@code schema} when the response completed normally.
     */
    public String createStructuredResponse(String instructions, String input, String schemaName, Map<String, Object> schema) {
        if (!StringUtils.hasText(properties.apiKey())) {
            throw new AiServiceException("OpenAI API key is not configured", false);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", properties.model());
        body.put("instructions", instructions);
        body.put("input", input);
        body.put("max_output_tokens", properties.maxOutputTokens());
        body.put("store", false);
        if (StringUtils.hasText(properties.reasoningEffort())) {
            body.put("reasoning", Map.of("effort", properties.reasoningEffort()));
        }
        body.put("text", Map.of("format", Map.of(
                "type", "json_schema",
                "name", schemaName,
                "strict", true,
                "schema", schema)));

        ResponsesApiResponse response;
        try {
            response = restClient.post()
                    .uri("/responses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(ResponsesApiResponse.class);
        } catch (HttpStatusCodeException e) {
            int status = e.getStatusCode().value();
            boolean retryable = status == 429 || status >= 500;
            log.warn("OpenAI request failed with HTTP {}: {}", status, truncate(e.getResponseBodyAsString(), 500));
            throw new AiServiceException("OpenAI returned HTTP " + status, retryable, e);
        } catch (RestClientException e) {
            throw new AiServiceException("Could not reach OpenAI: " + e.getMessage(), true, e);
        }

        return extractText(response);
    }

    private static String extractText(ResponsesApiResponse response) {
        if (response == null) {
            throw new AiServiceException("Empty response from OpenAI", true);
        }
        if (!"completed".equals(response.status())) {
            String reason = response.incompleteDetails() != null ? response.incompleteDetails().reason() : response.status();
            throw new AiServiceException("OpenAI response not completed: " + reason, true);
        }

        StringBuilder text = new StringBuilder();
        for (OutputItem item : response.output() == null ? List.<OutputItem>of() : response.output()) {
            if (!"message".equals(item.type()) || item.content() == null) {
                continue; // e.g. reasoning items
            }
            for (ContentPart part : item.content()) {
                if ("refusal".equals(part.type())) {
                    throw new AiServiceException("Model refused: " + truncate(part.refusal(), 200), true);
                }
                if ("output_text".equals(part.type()) && part.text() != null) {
                    text.append(part.text());
                }
            }
        }
        if (text.isEmpty()) {
            throw new AiServiceException("OpenAI response contained no output text", true);
        }
        return text.toString();
    }

    private static String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ResponsesApiResponse(
            String status,
            @JsonProperty("incomplete_details") IncompleteDetails incompleteDetails,
            List<OutputItem> output) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record IncompleteDetails(String reason) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record OutputItem(String type, List<ContentPart> content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ContentPart(String type, String text, String refusal) {
    }
}
