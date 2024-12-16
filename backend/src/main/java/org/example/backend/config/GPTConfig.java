package org.example.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class GPTConfig {

    @Value("${gpt.token}")
    private String gptToken;

    @Value("${gpt.api.url:https://api.openai.com/v1/chat/completions}")
    private String gptApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode sendGPTRequest(String prompt, String model) {
        try {
            // Prepare the messages list required by the ChatGPT API
            List<Map<String, String>> messages = List.of(
                    Map.of("role", "system", "content", "You are a helpful assistant simulating the role of a human trafficker or a child."),
                    Map.of("role", "user", "content", prompt)
            );

            // Create the payload for the request
            Map<String, Object> payload = Map.of(
                    "model", model, // Specify the model (e.g., "gpt-4o-mini")
                    "messages", messages,
                    "max_tokens", 150, // Adjust the response length as needed
                    "temperature", 0.7 // Control randomness
            );

            // Set up HTTP headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + gptToken);
            headers.set("Content-Type", "application/json");

            // Create the HTTP entity with headers and payload
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            // Send POST request to the ChatGPT API
            ResponseEntity<String> response = restTemplate.postForEntity(gptApiUrl, request, String.class);

            // Parse and return the response JSON
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            log.error("Error sending GPT request: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to communicate with GPT API", e);
        }
    }
}
