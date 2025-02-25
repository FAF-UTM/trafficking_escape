package org.example.backend.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class MessageDTO {
    private Long id;
    // Reference to the parent chat
    private Long chatId;
    private Boolean isOutgoing;
    private String messageText;
    private Instant sentAt;
}
