package org.example.backend.dto;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class ChatDTO {
    private Long id;
    // Reference to the owner user
    private Long userId;
    private String chatImageUrl;
    private String chatName;
    private Boolean isTrafficker;
    private Instant createdAt;
    private Instant updatedAt;
    // Optionally include messages if needed.
    private List<MessageDTO> messages;
}
