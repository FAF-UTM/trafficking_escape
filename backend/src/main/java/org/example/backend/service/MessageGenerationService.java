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

    public Map<String, Object> continueConversation(String context, String lastMessage, int currentDangerLevel, boolean isTrafficker) {
        try {
            // Add stricter rules for GPT response format
            String gameContext = """
                    This is an educational game designed to teach children about online safety. 
                    The player is a 13-year-old girl chatting with someone online. 
                    The AI must generate three distinct response options for the player to choose from.
                    - Each response should reflect realistic behavior for a cautious or naive 13-year-old girl.
                    - For each response, assign a **Risk Level** (integer between 1 and 10).
                    - Format strictly as:
                    1. <Response Option> (Risk Level: <Integer>)
                    2. <Response Option> (Risk Level: <Integer>)
                    3. <Response Option> (Risk Level: <Integer>)
                    """;

            String prompt = String.format(
                    gameContext +
                            " The current conversation context is: \"%s\". The last message received was: \"%s\". " +
                            "Generate exactly three response options in the specified format.",
                    context, lastMessage
            );

            // Call GPT API to generate responses
            JsonNode gptResponse = gptConfig.sendGPTRequest(prompt, "gpt-4o-mini");

            // Extract and parse the responses
            JsonNode choices = gptResponse.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("No responses received from GPT API");
            }

            String[] options = new String[3];
            int[] dangerLevels = new int[3];
            parseResponses(choices, options, dangerLevels);

            // Update the current danger level
            int updatedDangerLevel = currentDangerLevel + Math.max(dangerLevels[0], Math.max(dangerLevels[1], dangerLevels[2]));

            // Compile the result
            Map<String, Object> result = new HashMap<>();
            result.put("option1", options[0]);
            result.put("dangerLevel1", dangerLevels[0]);
            result.put("option2", options[1]);
            result.put("dangerLevel2", dangerLevels[1]);
            result.put("option3", options[2]);
            result.put("dangerLevel3", dangerLevels[2]);
            result.put("updatedDangerLevel", updatedDangerLevel);
            result.put("isTrafficker", isTrafficker);

            return result;
        } catch (Exception e) {
            log.error("Error generating player options", e);
            throw new RuntimeException("Failed to continue the conversation", e);
        }
    }

    private void parseResponses(JsonNode choices, String[] options, int[] dangerLevels) {
        int optionIndex = 0;

        for (JsonNode choice : choices) {
            String text = choice.get("message").get("content").asText().trim();

            // Match each response option
            String[] lines = text.split("\n");
            for (String line : lines) {
                if (optionIndex >= 3) break;

                String trimmedLine = line.trim();
                if (trimmedLine.matches("\\d+\\. .*\\(Risk Level: \\d+\\)")) {
                    // Extract response and risk level
                    int start = trimmedLine.indexOf('.') + 1;
                    int end = trimmedLine.lastIndexOf("(Risk Level:");
                    String response = trimmedLine.substring(start, end).trim();
                    int riskLevel = Integer.parseInt(trimmedLine.substring(trimmedLine.lastIndexOf(":") + 1, trimmedLine.lastIndexOf(')')).trim());

                    options[optionIndex] = response;
                    dangerLevels[optionIndex] = riskLevel;
                    optionIndex++;
                }
            }
        }

        // Fill in defaults for any missing options
        while (optionIndex < 3) {
            options[optionIndex] = "I'm not sure what to say."; // Default fallback response
            dangerLevels[optionIndex] = 1; // Low risk
            optionIndex++;
        }
    }
}
