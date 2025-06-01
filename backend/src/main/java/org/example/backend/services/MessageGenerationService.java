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

    public Map<String, Object> continueConversation(String context,
                                                    String lastMessage,
                                                    int currentDangerLevel,
                                                    boolean isTrafficker) {
        try {
            /* ----------------------------------------------------------
             * 1. NPC (trafficker / child) reply -- now with emoji guidance
             * ---------------------------------------------------------- */
            String chatResponsePrompt = String.format("""
                    This is an educational game designed to teach children about online safety.
                    The player is a 13-year-old girl chatting with someone online.
                    The AI must generate a **single** reply from the person the player is chatting with.

                    • If the person **is a trafficker**, the reply should be subtle, manipulative, raise tension **and use 1–2 “groomer-style” emojis** (e.g. 😉✨, 😏👍, 😘😉).  
                    • If the person **is another child**, the reply should be friendly, innocent, and contain **at least one playful emoji** suitable for a 13-year-old (e.g. 😊, 😂, 🤗).  
                    • Take the current danger level (%d) into account when deciding tone and wording.

                    Conversation so far: "%s"
                    Player’s last message: "%s"

                    👉 Return only the NPC’s reply as **one line of text**.
                    """, currentDangerLevel, context, lastMessage);

            JsonNode chatResponseJson = gptConfig.sendGPTRequest(chatResponsePrompt, "gpt-4o-mini");
            String chatResponse = parseChatResponse(chatResponseJson);

            /* ----------------------------------------------------------
             * 2. Three player-response options -- each with one emoji
             * ---------------------------------------------------------- */
            String playerResponsePrompt = String.format("""
                    This is an educational game designed to teach children about online safety.
                    The player is a 13-year-old girl chatting with someone online.

                    Generate **three** distinct replies the player could send back to **the message below** (she can be naive or cautious):

                    "%s"

                    Rules for each option:
                    • Must feel natural for a 13-year-old girl.
                    • **Include exactly one emoji** that fits the emotional tone.
                    • Assign a **Risk Level** integer (−10 to 10) indicating how risky that reply is.

                    Format **exactly** like:
                    1. <Response option> (Risk Level: <Integer>)
                    2. <Response option> (Risk Level: <Integer>)
                    3. <Response option> (Risk Level: <Integer>)
                    """, chatResponse);

            JsonNode playerResponseJson = gptConfig.sendGPTRequest(playerResponsePrompt, "gpt-4o-mini");

            String[] options = new String[3];
            int[] dangerLevels = new int[3];
            parseResponses(playerResponseJson, options, dangerLevels);

            int updatedDangerLevel =
                    currentDangerLevel + Math.max(dangerLevels[0],
                            Math.max(dangerLevels[1], dangerLevels[2]));

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

    /* ---------- helpers (unchanged) ---------- */

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
            for (String line : text.split("\n")) {
                if (optionIndex >= 3) break;
                String trimmed = line.trim();
                if (trimmed.matches("\\d+\\. .*\\(Risk Level: \\-?\\d+\\)")) {
                    int start = trimmed.indexOf('.') + 1;
                    int end = trimmed.lastIndexOf("(Risk Level:");
                    options[optionIndex] =
                            trimmed.substring(start, end).trim();
                    dangerLevels[optionIndex] =
                            Integer.parseInt(trimmed.substring(
                                    trimmed.lastIndexOf(':') + 1,
                                    trimmed.lastIndexOf(')')).trim());
                    optionIndex++;
                }
            }
        }

        while (optionIndex < 3) {          // fallback values
            options[optionIndex] = "I'm not sure what to say. 🤔";
            dangerLevels[optionIndex] = 1;
            optionIndex++;
        }
    }
}
