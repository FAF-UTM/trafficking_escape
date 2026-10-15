package org.example.backend.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.GamePlaySessionRequest;
import org.example.backend.dto.GamePlaySessionResponse;
import org.example.backend.security.RateLimiter;
import org.example.backend.services.GamePlaySessionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** Anonymous play-time statistics; public because the mini-games report without a token. */
@RestController
@RequestMapping("/api/v1/gameplay")
@RequiredArgsConstructor
public class GamePlaySessionController {

    private final GamePlaySessionService service;
    private final RateLimiter rateLimiter;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GamePlaySessionResponse create(@Valid @RequestBody GamePlaySessionRequest request, HttpServletRequest http) {
        rateLimiter.check(RateLimiter.Limit.GAMEPLAY, http.getRemoteAddr());
        return service.record(request);
    }
}
