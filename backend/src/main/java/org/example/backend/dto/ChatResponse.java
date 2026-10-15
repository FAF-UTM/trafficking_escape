package org.example.backend.dto;

import org.example.backend.model.Chat;

import java.time.Instant;
import java.util.List;

public record ChatResponse(
        Long id,
        Long userId,
        String chatImageUrl,
        String chatName,
        Boolean isTrafficker,
        Instant createdAt,
        Instant updatedAt,
        List<MessageResponse> messages
) {
    public static ChatResponse from(Chat chat, List<MessageResponse> messages) {
        return new ChatResponse(chat.getId(), chat.getUserId(), chat.getChatImageUrl(), chat.getChatName(),
                chat.getIsTrafficker(), chat.getCreatedAt(), chat.getUpdatedAt(), messages);
    }
}
