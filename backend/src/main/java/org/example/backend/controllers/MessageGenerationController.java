package org.example.backend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.MessageGenerationRequest;
import org.example.backend.dto.MessageGenerationResponse;
import org.example.backend.security.PlatformUserDetails;
import org.example.backend.security.RateLimiter;
import org.example.backend.services.MessageGenerationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/message-generation")
public class MessageGenerationController {

    private final MessageGenerationService service;
    private final RateLimiter rateLimiter;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public MessageGenerationResponse generateMessage(@Valid @RequestBody MessageGenerationRequest request,
                                                     @AuthenticationPrincipal PlatformUserDetails principal) {
        // Each call costs money; cap it per user.
        rateLimiter.check(RateLimiter.Limit.AI_GENERATION, "user:" + principal.getId());
        return service.continueConversation(request, principal.getId());
    }
}
