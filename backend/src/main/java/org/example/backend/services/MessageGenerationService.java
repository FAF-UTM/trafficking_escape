package org.example.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.config.GPTConfig;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@AllArgsConstructor
public class MessageGenerationService {
    private final GPTConfig gptConfig;

    public Map<String, Object> continueConversation(String context, String lastMessage, int currentDangerLevel, boolean isTrafficker) {
        try {
            // Generate the chat response based on the isTrafficker flag and danger level
            String chatResponsePrompt = String.format("""
                    This is an educational game designed to teach children about online safety. 
                    The player is a 13-year-old girl chatting with someone online. 
                    The AI must generate a single response from the person the player is chatting with.
                    - If the person is a trafficker, their response should be manipulative, subtle, and increase tension.
                    - If the person is another child, their response should be friendly and innocent.
                    - Consider the current danger level (%d) and adjust the tone of the response accordingly.
                    
                    The current conversation context is: "%s".
                    The last message from the player was: "%s".
                    
                    Provide only the response as a single line of text.
                    """, currentDangerLevel, context, lastMessage);

            JsonNode chatResponseJson = gptConfig.sendGPTRequest(chatResponsePrompt, "gpt-4o-mini");
            String chatResponse = parseChatResponse(chatResponseJson);

            // Generate three player response options to the chat response
            String playerResponsePrompt = String.format("""
                    This is an educational game designed to teach children about online safety. 
                    The player is a 13-year-old girl chatting with someone online. 
                    The AI must generate three distinct response options for the player to choose from, replying to the following message:
                    
                    "%s"
                    
                    - Each response should reflect realistic behavior for a cautious or naive 13-year-old girl.
                    - For each response, assign a **Risk Level** (integer between -10 and 10).
                    - Format strictly as:
                    1. <Response Option> (Risk Level: <Integer>)
                    2. <Response Option> (Risk Level: <Integer>)
                    3. <Response Option> (Risk Level: <Integer>)
                    """, chatResponse);

            JsonNode playerResponseJson = gptConfig.sendGPTRequest(playerResponsePrompt, "gpt-4o-mini");

            String[] options = new String[3];
            int[] dangerLevels = new int[3];
            parseResponses(playerResponseJson, options, dangerLevels);

            // Update the current danger level
            int updatedDangerLevel = currentDangerLevel + Math.max(dangerLevels[0], Math.max(dangerLevels[1], dangerLevels[2]));

            // Compile the result
            Map<String, Object> result = new HashMap<>();
            result.put("chatResponse", chatResponse);
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
            log.error("Error generating conversation options", e);
            throw new RuntimeException("Failed to continue the conversation", e);
        }
    }

    private String parseChatResponse(JsonNode chatResponseJson) {
        JsonNode choices = chatResponseJson.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("No responses received from GPT API for chat response.");
        }
        return choices.get(0).get("message").get("content").asText().trim();
    }

    private void parseResponses(JsonNode choicesJson, String[] options, int[] dangerLevels) {
        int optionIndex = 0;

        JsonNode choices = choicesJson.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("No responses received from GPT API for player responses.");
        }

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
