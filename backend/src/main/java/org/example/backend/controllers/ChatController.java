package org.example.backend.controllers;

import org.example.backend.dto.ChatDTO;
import org.example.backend.security.PlatformUserDetails;
import org.example.backend.services.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chats")
@PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ChatDTO> createChat(@RequestBody ChatDTO chatDTO,
                                              @AuthenticationPrincipal PlatformUserDetails principal) {
        ChatDTO createdChat = chatService.createChat(chatDTO, principal.getId());
        return ResponseEntity.ok(createdChat);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChatDTO> getChat(@PathVariable Long id,
                                           @AuthenticationPrincipal PlatformUserDetails principal) {
        ChatDTO chatDTO = chatService.getChatById(id, principal.getId());
        return ResponseEntity.ok(chatDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChatDTO> updateChat(@PathVariable Long id,
                                              @RequestBody ChatDTO chatDTO,
                                              @AuthenticationPrincipal PlatformUserDetails principal) {
        ChatDTO updatedChat = chatService.updateChat(id, chatDTO, principal.getId());
        return ResponseEntity.ok(updatedChat);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChat(@PathVariable Long id,
                                           @AuthenticationPrincipal PlatformUserDetails principal) {
        chatService.deleteChat(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChatDTO>> getChatsByUser(@PathVariable Long userId,
                                                        @AuthenticationPrincipal PlatformUserDetails principal) {
        List<ChatDTO> chats = chatService.getChatsByUserId(userId, principal.getId());
        return ResponseEntity.ok(chats);
    }
}
