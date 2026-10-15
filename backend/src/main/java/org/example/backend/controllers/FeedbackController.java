package org.example.backend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.FeedbackRequest;
import org.example.backend.dto.FeedbackResponse;
import org.example.backend.services.FeedbackService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class FeedbackController {

    private final FeedbackService service;

    @PostMapping
    public FeedbackResponse submit(@Valid @RequestBody FeedbackRequest request) {
        return service.createFeedback(request);
    }
}
