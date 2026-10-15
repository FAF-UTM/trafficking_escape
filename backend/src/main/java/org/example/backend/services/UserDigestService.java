package org.example.backend.services;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.UserDangerDigestDTO;
import org.example.backend.repos.ChatRepository;
import org.example.backend.repos.MessageRepository;
import org.example.backend.repos.SessionStatsProjection;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDigestService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;

    /** Linear score: average danger -10 gives 100, 0 gives 50, +10 gives 1. */
    static int score(double averageDanger) {
        int score = (int) Math.round((-averageDanger + 10) * 5);
        return Math.max(1, Math.min(100, score));
    }

    @Transactional(readOnly = true)
    public UserDangerDigestDTO build(Long userId) {
        long chats = chatRepository.countByUserId(userId);
        long messages = messageRepository.countForUser(userId);
        SessionStatsProjection stats = messageRepository.aggregateForUser(userId);

        // Aggregates over zero rated messages come back as nulls.
        if (stats == null || stats.getAvg() == null) {
            return new UserDangerDigestDTO(100, chats, messages, 0.0, 0, 0);
        }
        return new UserDangerDigestDTO(score(stats.getAvg()), chats, messages,
                stats.getAvg(), stats.getMax(), stats.getMin());
    }
}
