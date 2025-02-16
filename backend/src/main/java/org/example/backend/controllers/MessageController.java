package org.example.backend.controllers;

import org.example.backend.dto.MessageDTO;
import org.example.backend.security.PlatformUserDetails;
import org.example.backend.services.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<MessageDTO> createMessage(@RequestBody MessageDTO messageDTO,
                                                    @AuthenticationPrincipal PlatformUserDetails principal) {
        MessageDTO createdMessage = messageService.createMessage(messageDTO, principal.getId());
        return ResponseEntity.ok(createdMessage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageDTO> getMessage(@PathVariable Long id,
                                                 @AuthenticationPrincipal PlatformUserDetails principal) {
        MessageDTO messageDTO = messageService.getMessageById(id, principal.getId());
        return ResponseEntity.ok(messageDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageDTO> updateMessage(@PathVariable Long id,
                                                    @RequestBody MessageDTO messageDTO,
                                                    @AuthenticationPrincipal PlatformUserDetails principal) {
        MessageDTO updatedMessage = messageService.updateMessage(id, messageDTO, principal.getId());
        return ResponseEntity.ok(updatedMessage);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id,
                                              @AuthenticationPrincipal PlatformUserDetails principal) {
        messageService.deleteMessage(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByChat(@PathVariable Long chatId,
                                                              @AuthenticationPrincipal PlatformUserDetails principal) {
        List<MessageDTO> messages = messageService.getMessagesByChatId(chatId, principal.getId());
        return ResponseEntity.ok(messages);
    }
}
