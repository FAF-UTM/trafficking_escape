/* ──────────────────────────────────────────────────────────────
 * File: src/main/java/org/example/backend/controllers/MessageGenerationController.java
 * ────────────────────────────────────────────────────────────── */
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

        /* ---------- basic presence checks ---------- */
        if (request.get("context") == null || request.get("lastMessage") == null ||
                request.get("currentDangerLevel") == null || request.get("isTrafficker") == null) {
            return ResponseEntity.badRequest()
                    .body("Missing required fields: 'context', 'lastMessage', 'currentDangerLevel', or 'isTrafficker'.");
        }

        try {
            /* ---------- safe extraction & type checks ---------- */
            String context      = (String) request.get("context");
            String lastMessage  = (String) request.get("lastMessage");

            int currentDangerLevel = ((Number) request.get("currentDangerLevel")).intValue();
            boolean isTrafficker   = (Boolean) request.get("isTrafficker");

            String language = (String) request.getOrDefault("language", "en");

            /* ---------- delegate to service ---------- */
            Map<String, Object> response =
                    service.continueConversation(context, lastMessage, currentDangerLevel, isTrafficker, language);

            /* ---------- minimal integrity check ---------- */
            if (!response.containsKey("option1") || !response.containsKey("dangerLevel1") ||
                    !response.containsKey("option2") || !response.containsKey("dangerLevel2") ||
                    !response.containsKey("option3") || !response.containsKey("dangerLevel3")) {
                return ResponseEntity.badRequest()
                        .body("Generated response is incomplete. Ensure each option has a corresponding risk level.");
            }

            return ResponseEntity.ok(response);

        } catch (ClassCastException e) {
            log.warn("Bad data types in request", e);
            return ResponseEntity.badRequest()
                    .body("Invalid data types: 'currentDangerLevel' must be numeric and 'isTrafficker' must be boolean.");
        } catch (Exception e) {
            log.error("Error generating message", e);
            return ResponseEntity.status(500).body("An error occurred while generating the message.");
        }
    }
}
