package org.example.backend.services;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.GamePlaySessionRequest;
import org.example.backend.dto.GamePlaySessionResponse;
import org.example.backend.model.GamePlaySession;
import org.example.backend.repos.GamePlaySessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class GamePlaySessionService {

    private final GamePlaySessionRepository repository;
    private final Clock clock;

    @Transactional
    public GamePlaySessionResponse record(GamePlaySessionRequest request) {
        Instant now = clock.instant();
        GamePlaySession session = new GamePlaySession();
        session.setGameName(request.gameName());
        session.setTotalSeconds(request.totalSeconds());
        session.setPlayedAt(request.playedAt() != null && request.playedAt().isBefore(now) ? request.playedAt() : now);
        return GamePlaySessionResponse.from(repository.save(session));
    }
}
