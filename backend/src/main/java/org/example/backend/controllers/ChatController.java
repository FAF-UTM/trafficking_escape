package org.example.backend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.ChatRequest;
import org.example.backend.dto.ChatResponse;
import org.example.backend.security.PlatformUserDetails;
import org.example.backend.services.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse createChat(@Valid @RequestBody ChatRequest request,
                                   @AuthenticationPrincipal PlatformUserDetails principal) {
        return chatService.createChat(request, principal.getId());
    }

    @GetMapping("/{id}")
    public ChatResponse getChat(@PathVariable Long id, @AuthenticationPrincipal PlatformUserDetails principal) {
        return chatService.getChat(id, principal.getId());
    }

    @PutMapping("/{id}")
    public ChatResponse updateChat(@PathVariable Long id,
                                   @Valid @RequestBody ChatRequest request,
                                   @AuthenticationPrincipal PlatformUserDetails principal) {
        return chatService.updateChat(id, request, principal.getId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChat(@PathVariable Long id, @AuthenticationPrincipal PlatformUserDetails principal) {
        chatService.deleteChat(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public List<ChatResponse> getChatsByUser(@PathVariable Long userId,
                                             @AuthenticationPrincipal PlatformUserDetails principal) {
        return chatService.getChatsByUserId(userId, principal.getId());
    }
}
