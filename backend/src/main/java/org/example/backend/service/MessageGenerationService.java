package org.example.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.config.GPTConfig;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@AllArgsConstructor
public class MessageGenerationService {
    private final GPTConfig gptConfig;

    public Map<String, Object> generateChatOptions(String context, boolean isTrafficker) {
        try {
            // Generate the prompt dynamically based on the role
            String role = isTrafficker ? "human trafficker" : "child";
            String prompt = String.format(
                    "You are a %s. The context is: \"%s\". Generate three conversational responses that fit the scenario.",
                    role, context
            );

            // Call the GPT API
            JsonNode gptResponse = gptConfig.sendGPTRequest(prompt);

            // Extract and randomize danger levels
            String option1 = gptResponse.get("choices").get(0).get("text").asText().trim();
            String option2 = gptResponse.get("choices").get(1).get("text").asText().trim();
            String option3 = gptResponse.get("choices").get(2).get("text").asText().trim();

            // Random danger levels (1-10)
            Random random = new Random();
            int dangerLevel1 = isTrafficker ? random.nextInt(4) + 7 : random.nextInt(3) + 1;
            int dangerLevel2 = isTrafficker ? random.nextInt(4) + 7 : random.nextInt(3) + 1;
            int dangerLevel3 = isTrafficker ? random.nextInt(4) + 7 : random.nextInt(3) + 1;

            // Compile the result
            Map<String, Object> result = new HashMap<>();
            result.put("option1", option1);
            result.put("dangerLevel1", dangerLevel1);
            result.put("option2", option2);
            result.put("dangerLevel2", dangerLevel2);
            result.put("option3", option3);
            result.put("dangerLevel3", dangerLevel3);
            result.put("isTrafficker", isTrafficker);

            return result;
        } catch (Exception e) {
            log.error("Error generating chat options", e);
            throw new RuntimeException("Failed to generate chat options");
        }
    }
}
