package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.services.MessageGenerationService;
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
            // Validate input
            if (request.get("context") == null || request.get("lastMessage") == null ||
                    request.get("currentDangerLevel") == null || request.get("isTrafficker") == null) {
                return ResponseEntity.badRequest().body("Missing required fields: 'context', 'lastMessage', 'currentDangerLevel', or 'isTrafficker'.");
            }

            // Extract and cast the required fields
            String context = (String) request.get("context");
            String lastMessage = (String) request.get("lastMessage");
            int currentDangerLevel;
            boolean isTrafficker;

            try {
                currentDangerLevel = (Integer) request.get("currentDangerLevel");
                isTrafficker = (Boolean) request.get("isTrafficker");
            } catch (ClassCastException e) {
                return ResponseEntity.badRequest().body("Invalid data types: 'currentDangerLevel' must be an integer and 'isTrafficker' must be a boolean.");
            }

            // Generate the response
            Map<String, Object> response = service.continueConversation(context, lastMessage, currentDangerLevel, isTrafficker);

            // Validate the generated response
            if (!response.containsKey("option1") || !response.containsKey("dangerLevel1") ||
                    !response.containsKey("option2") || !response.containsKey("dangerLevel2") ||
                    !response.containsKey("option3") || !response.containsKey("dangerLevel3")) {
                return ResponseEntity.badRequest().body("Generated response is incomplete. Ensure each option has a corresponding risk level.");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating message", e);
            return ResponseEntity.status(500).body("An error occurred while generating the message.");
        }
    }
}
