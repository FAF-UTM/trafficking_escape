package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.service.MessageGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/message-generation")
public class MessageGenerationController {
    private final MessageGenerationService service;

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<?> generateMessage(@RequestBody Map<String, Object> request) {
        try {
            // Extract the required fields from the JSON request
            String context = (String) request.get("context");
            String lastMessage = (String) request.get("lastMessage");
            int currentDangerLevel = (int) request.get("currentDangerLevel");
            boolean isTrafficker = (boolean) request.get("isTrafficker");

            // Generate the response
            Map<String, Object> response = service.continueConversation(context, lastMessage, currentDangerLevel, isTrafficker);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating message", e);
            return ResponseEntity.badRequest().body("Failed to generate message");
        }
    }
}
