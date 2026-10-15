package org.example.backend.dto;

import org.example.backend.model.Message;

import java.time.Instant;

public record MessageResponse(
        Long id,
        Long chatId,
        Boolean isOutgoing,
        String messageText,
        Integer dangerLevel,
        Instant sentAt
) {
    public static MessageResponse from(Message message) {
        return new MessageResponse(message.getId(), message.getChatId(), message.getIsOutgoing(),
                message.getMessageText(), message.getDangerLevel(), message.getSentAt());
    }
}
