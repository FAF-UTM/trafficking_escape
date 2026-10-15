package org.example.backend.services;

import lombok.extern.slf4j.Slf4j;
import org.example.backend.ai.ChatTurnPrompt;
import org.example.backend.ai.ChatTurnPrompt.HistoryLine;
import org.example.backend.ai.OpenAiResponsesClient;
import org.example.backend.dto.MessageGenerationRequest;
import org.example.backend.dto.MessageGenerationResponse;
import org.example.backend.exceptions.AiServiceException;
import org.example.backend.model.Chat;
import org.example.backend.model.Message;
import org.example.backend.repos.MessageRepository;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Produces the next turn of a simulated chat: the contact's reply plus three answer options for the
 * player, each with a risk score. One structured-output call to the model generates both.
 */
@Slf4j
@Service
public class MessageGenerationService {

    private static final int MAX_ATTEMPTS = 2;
    private static final int MAX_REPLY_CHARS = 600;
    private static final int MAX_OPTION_CHARS = 300;

    record PlayerOption(String text, int riskLevel) {
    }

    record ChatTurn(String npcReply, List<PlayerOption> playerOptions) {
    }

    private final OpenAiResponsesClient client;
    private final ChatTurnPrompt prompt;
    private final ChatService chatService;
    private final MessageRepository messageRepository;
    private final JsonMapper jsonMapper;

    public MessageGenerationService(OpenAiResponsesClient client, ChatTurnPrompt prompt, ChatService chatService,
                                    MessageRepository messageRepository, JsonMapper jsonMapper) {
        this.client = client;
        this.prompt = prompt;
        this.chatService = chatService;
        this.messageRepository = messageRepository;
        this.jsonMapper = jsonMapper;
    }

    public MessageGenerationResponse continueConversation(MessageGenerationRequest request, Long currentUserId) {
        boolean isTrafficker = request.isTrafficker();
        List<HistoryLine> history = List.of();

        if (request.chatId() != null) {
            Chat chat = chatService.getOwnedChat(request.chatId(), currentUserId);
            isTrafficker = chat.getIsTrafficker(); // the stored chat is authoritative
            history = loadHistory(chat.getId());
        }

        String language = request.language() == null || request.language().isBlank() ? "en" : request.language();
        int currentDanger = request.currentDangerLevel();
        String input = prompt.buildInput(isTrafficker, currentDanger, ChatTurnPrompt.languageName(language),
                request.context(), history, request.lastMessage());

        ChatTurn turn = generateTurn(input);

        List<PlayerOption> options = new ArrayList<>(turn.playerOptions());
        // The model tends to list the safe option first; shuffle so position gives nothing away.
        Collections.shuffle(options);

        // Kept from the original API contract: the score assumes the riskiest option.
        int maxRisk = options.stream().mapToInt(PlayerOption::riskLevel).max().orElse(0);

        return new MessageGenerationResponse(
                turn.npcReply(),
                options.get(0).text(), options.get(0).riskLevel(),
                options.get(1).text(), options.get(1).riskLevel(),
                options.get(2).text(), options.get(2).riskLevel(),
                currentDanger + maxRisk,
                isTrafficker,
                language);
    }

    private List<HistoryLine> loadHistory(Long chatId) {
        List<Message> recent = new ArrayList<>(messageRepository.findTop30ByChatIdOrderBySentAtDescIdDesc(chatId));
        Collections.reverse(recent);
        return recent.stream()
                .map(m -> new HistoryLine(Boolean.TRUE.equals(m.getIsOutgoing()), m.getMessageText()))
                .toList();
    }

    private ChatTurn generateTurn(String input) {
        AiServiceException lastFailure = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                String json = client.createStructuredResponse(prompt.instructions(), input,
                        ChatTurnPrompt.SCHEMA_NAME, ChatTurnPrompt.SCHEMA);
                return validate(parse(json));
            } catch (AiServiceException e) {
                lastFailure = e;
                if (!e.isRetryable()) break;
                log.info("Chat turn attempt {} failed: {}", attempt, e.getMessage());
            }
        }
        throw lastFailure;
    }

    private ChatTurn parse(String json) {
        try {
            return jsonMapper.readValue(json, ChatTurn.class);
        } catch (JacksonException e) {
            throw new AiServiceException("Model output was not valid JSON", true, e);
        }
    }

    /** Normalises the model output; anything unusable counts as a failed attempt. */
    static ChatTurn validate(ChatTurn turn) {
        if (turn == null || turn.npcReply() == null || turn.npcReply().isBlank() || turn.playerOptions() == null) {
            throw new AiServiceException("Model output is missing fields", true);
        }
        List<PlayerOption> options = turn.playerOptions().stream()
                .filter(o -> o != null && o.text() != null && !o.text().isBlank())
                .limit(3)
                .map(o -> new PlayerOption(truncate(o.text(), MAX_OPTION_CHARS), Math.clamp(o.riskLevel(), -10, 10)))
                .toList();
        if (options.size() < 3) {
            throw new AiServiceException("Model returned fewer than three player options", true);
        }
        return new ChatTurn(truncate(turn.npcReply(), MAX_REPLY_CHARS), options);
    }

    private static String truncate(String s, int max) {
        String trimmed = s.strip();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }
}
