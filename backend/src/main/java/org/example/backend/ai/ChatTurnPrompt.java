package org.example.backend.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Builds the model request for one chat turn: the fixed instructions (prompts/chat-turn-instructions.md),
 * the per-turn input and the JSON schema the answer must follow.
 */
@Component
public class ChatTurnPrompt {

    public static final String SCHEMA_NAME = "chat_turn";

    private static final int MAX_MESSAGE_CHARS = 500;
    private static final int MAX_CONTEXT_CHARS = 1000;

    /** Output schema; strict mode requires every property to be listed in "required". */
    public static final Map<String, Object> SCHEMA = Map.of(
            "type", "object",
            "additionalProperties", false,
            "required", List.of("npcReply", "playerOptions"),
            "properties", Map.of(
                    "npcReply", Map.of(
                            "type", "string",
                            "description", "The contact's next chat message."),
                    "playerOptions", Map.of(
                            "type", "array",
                            "description", "Exactly three replies the player can choose from.",
                            "items", Map.of(
                                    "type", "object",
                                    "additionalProperties", false,
                                    "required", List.of("text", "riskLevel"),
                                    "properties", Map.of(
                                            "text", Map.of("type", "string"),
                                            "riskLevel", Map.of(
                                                    "type", "integer",
                                                    "description", "-10 (very safe) to 10 (very risky)"))))));

    public record HistoryLine(boolean fromPlayer, String text) {
    }

    private final String instructions;

    public ChatTurnPrompt(@Value("classpath:prompts/chat-turn-instructions.md") Resource instructionsResource) {
        try {
            this.instructions = instructionsResource.getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not load chat prompt", e);
        }
    }

    public String instructions() {
        return instructions;
    }

    /** Language name for a BCP 47 tag, e.g. "nl" becomes "Dutch". Unknown tags fall back to English. */
    public static String languageName(String languageTag) {
        if (languageTag == null || languageTag.isBlank()) {
            return "English";
        }
        String name = Locale.forLanguageTag(languageTag.replace('_', '-')).getDisplayLanguage(Locale.ENGLISH);
        return name.isBlank() ? "English" : name;
    }

    /**
     * Player-controlled text is wrapped in tags and stripped of angle brackets so it cannot
     * close a section early; the instructions tell the model to treat it as data.
     */
    public String buildInput(boolean isTrafficker, int currentDangerLevel, String languageName, String context,
                             List<HistoryLine> history, String lastMessage) {
        StringBuilder sb = new StringBuilder();
        sb.append("<game_state>\n")
                .append("npc_role: ").append(isTrafficker ? "trafficker" : "peer").append('\n')
                .append("current_danger_level: ").append(currentDangerLevel).append('\n')
                .append("turns_so_far: ").append(history.size()).append('\n')
                .append("language: ").append(languageName).append('\n')
                .append("</game_state>\n\n");

        if (context != null && !context.isBlank()) {
            sb.append("<scenario>\n").append(sanitize(context, MAX_CONTEXT_CHARS)).append("\n</scenario>\n\n");
        }

        sb.append("<transcript>\n");
        if (history.isEmpty()) {
            sb.append("(no earlier messages)\n");
        }
        for (HistoryLine line : history) {
            sb.append(line.fromPlayer() ? "PLAYER: " : "CONTACT: ")
                    .append(sanitize(line.text(), MAX_MESSAGE_CHARS))
                    .append('\n');
        }
        sb.append("</transcript>\n\n");

        sb.append("<player_last_message>\n")
                .append(sanitize(lastMessage, MAX_MESSAGE_CHARS))
                .append("\n</player_last_message>\n");
        return sb.toString();
    }

    static String sanitize(String text, int maxChars) {
        String cleaned = text.replace('<', '‹').replace('>', '›').strip();
        return cleaned.length() <= maxChars ? cleaned : cleaned.substring(0, maxChars) + "…";
    }
}
