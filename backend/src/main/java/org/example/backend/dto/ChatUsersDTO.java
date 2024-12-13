package org.example.backend.dto;

import lombok.Data;

@Data
public class ChatUsersDTO {
    private Long id;
    private String imgSrc;
    private String name;
    private String message;
    private String chatID;
    private String createdAt;
    private String updatedAt;
    private Long user;
    private Long chatData;
}
