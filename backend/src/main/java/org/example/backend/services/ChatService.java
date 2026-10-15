package org.example.backend.services;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.ChatRequest;
import org.example.backend.dto.ChatResponse;
import org.example.backend.dto.MessageResponse;
import org.example.backend.exceptions.NotFoundException;
import org.example.backend.model.Chat;
import org.example.backend.model.Message;
import org.example.backend.repos.ChatRepository;
import org.example.backend.repos.MessageRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public ChatResponse createChat(ChatRequest request, Long currentUserId) {
        Chat chat = new Chat();
        chat.setUserId(currentUserId);
        apply(chat, request);
        return ChatResponse.from(chatRepository.save(chat), List.of());
    }

    @Transactional
    public ChatResponse updateChat(Long id, ChatRequest request, Long currentUserId) {
        Chat chat = getOwnedChat(id, currentUserId);
        apply(chat, request);
        chatRepository.flush(); // fire @PreUpdate so the response carries updatedAt
        return toResponse(chat);
    }

    @Transactional(readOnly = true)
    public ChatResponse getChat(Long id, Long currentUserId) {
        return toResponse(getOwnedChat(id, currentUserId));
    }

    @Transactional(readOnly = true)
    public List<ChatResponse> getChatsByUserId(Long userId, Long currentUserId) {
        if (!userId.equals(currentUserId)) {
            throw new AccessDeniedException("You can only list your own chats");
        }
        List<Chat> chats = chatRepository.findByUserIdOrderByCreatedAtAsc(userId);
        if (chats.isEmpty()) {
            return List.of();
        }

        // One query for all messages instead of one per chat.
        Map<Long, List<MessageResponse>> messagesByChat = messageRepository
                .findByChatIdInOrderBySentAtAscIdAsc(chats.stream().map(Chat::getId).toList())
                .stream()
                .collect(Collectors.groupingBy(Message::getChatId,
                        Collectors.mapping(MessageResponse::from, Collectors.toList())));

        return chats.stream()
                .map(chat -> ChatResponse.from(chat, messagesByChat.getOrDefault(chat.getId(), List.of())))
                .toList();
    }

    @Transactional
    public void deleteChat(Long id, Long currentUserId) {
        chatRepository.delete(getOwnedChat(id, currentUserId));
    }

    /** Returns 404 for chats of other users so chat ids cannot be probed. */
    Chat getOwnedChat(Long id, Long currentUserId) {
        return chatRepository.findByIdAndUserId(id, currentUserId)
                .orElseThrow(() -> new NotFoundException("Chat not found"));
    }

    private ChatResponse toResponse(Chat chat) {
        List<MessageResponse> messages = messageRepository.findByChatIdOrderBySentAtAscIdAsc(chat.getId()).stream()
                .map(MessageResponse::from)
                .toList();
        return ChatResponse.from(chat, messages);
    }

    private static void apply(Chat chat, ChatRequest request) {
        chat.setChatImageUrl(request.chatImageUrl());
        chat.setChatName(request.chatName());
        chat.setIsTrafficker(request.isTrafficker());
    }
}
