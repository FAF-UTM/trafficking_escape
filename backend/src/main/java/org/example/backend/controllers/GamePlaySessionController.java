package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.example.backend.model.GamePlaySession;
import org.example.backend.repos.GamePlaySessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/gameplay")
@RequiredArgsConstructor
public class GamePlaySessionController {

    private final GamePlaySessionRepository repository;

    public record GamePlaySessionRequest(String gameName, Integer totalSeconds, Instant playedAt) { }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GamePlaySession create(@RequestBody GamePlaySessionRequest body) {
        GamePlaySession s = new GamePlaySession();
        s.setGameName(body.gameName());
        s.setTotalSeconds(body.totalSeconds());
        s.setPlayedAt(body.playedAt() != null ? body.playedAt() : Instant.now());
        return repository.save(s);
    }
}


