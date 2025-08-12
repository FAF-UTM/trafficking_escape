package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.FeedbackDTO;
import org.example.backend.services.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
public class FeedbackController {
    private final FeedbackService service;

    @PostMapping
    public ResponseEntity<FeedbackDTO> submit(@RequestBody FeedbackDTO dto) {
        FeedbackDTO created = service.createFeedback(dto);
        return ResponseEntity.ok(created);
    }
}