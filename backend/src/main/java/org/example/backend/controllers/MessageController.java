package org.example.backend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.MessageRequest;
import org.example.backend.dto.MessageResponse;
import org.example.backend.dto.MessageUpdateRequest;
import org.example.backend.security.PlatformUserDetails;
import org.example.backend.services.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public MessageResponse createMessage(@Valid @RequestBody MessageRequest request,
                                         @AuthenticationPrincipal PlatformUserDetails principal) {
        return messageService.createMessage(request, principal.getId());
    }

    @GetMapping("/{id}")
    public MessageResponse getMessage(@PathVariable Long id, @AuthenticationPrincipal PlatformUserDetails principal) {
        return messageService.getMessage(id, principal.getId());
    }

    @PutMapping("/{id}")
    public MessageResponse updateMessage(@PathVariable Long id,
                                         @Valid @RequestBody MessageUpdateRequest request,
                                         @AuthenticationPrincipal PlatformUserDetails principal) {
        return messageService.updateMessage(id, request, principal.getId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id,
                                              @AuthenticationPrincipal PlatformUserDetails principal) {
        messageService.deleteMessage(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/chat/{chatId}")
    public List<MessageResponse> getMessagesByChat(@PathVariable Long chatId,
                                                   @AuthenticationPrincipal PlatformUserDetails principal) {
        return messageService.getMessagesByChatId(chatId, principal.getId());
    }
}
