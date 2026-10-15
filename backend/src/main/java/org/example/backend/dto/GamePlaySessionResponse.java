package org.example.backend.dto;

import org.example.backend.model.GamePlaySession;

import java.time.Instant;

public record GamePlaySessionResponse(Long id, String gameName, Integer totalSeconds, Instant playedAt) {
    public static GamePlaySessionResponse from(GamePlaySession s) {
        return new GamePlaySessionResponse(s.getId(), s.getGameName(), s.getTotalSeconds(), s.getPlayedAt());
    }
}
