package org.example.backend.dto;

import lombok.Data;
import org.example.backend.model.ChatUsers;

import java.time.Instant;
import java.util.List;

@Data
public class ChatDataDTO {
    private Long id;
    private String from;
    private String fromImg;
    private String sendType;
    private List<String> messages;
    private Instant createdAt;
    private Instant updatedAt;
    private ChatUsers chatUser;
}
