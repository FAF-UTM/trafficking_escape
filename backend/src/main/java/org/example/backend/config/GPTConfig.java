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

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class GPTConfig {

    @Value("${gpt.token}")
    private String gptToken;

    @Value("${gpt.api.url:https://api.openai.com/v1/completions}") // Default URL
    private String gptApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getGptToken() {
        return gptToken;
    }

    public JsonNode sendGPTRequest(String prompt) {
        try {
            // Create the payload for the request
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", "text-davinci-003"); // Specify your GPT model
            payload.put("prompt", prompt);
            payload.put("max_tokens", 150); // Adjust based on your needs
            payload.put("temperature", 0.7); // Controls randomness of responses

            // Create headers
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + gptToken);
            headers.set("Content-Type", "application/json");

            // Create the HTTP entity with headers and payload
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            // Send the POST request to GPT API
            ResponseEntity<String> response = restTemplate.postForEntity(gptApiUrl, request, String.class);

            // Parse and return the response
            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            log.error("Error sending GPT request: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to communicate with GPT API", e);
        }
    }
}
