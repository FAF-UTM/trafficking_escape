// service/UserDigestService.java
package org.example.backend.services;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.UserDangerDigestDTO;
import org.example.backend.repos.ChatRepository;
import org.example.backend.repos.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserDigestService {

    private final ChatRepository chatRepo;
    private final MessageRepository msgRepo;

    @Transactional(readOnly = true)
    public UserDangerDigestDTO build(Long userId) {

        long chats = chatRepo.countByUserId(userId);
        var stats = msgRepo.aggregateForUser(userId);

        if (stats == null) {     // no messages yet
            return new UserDangerDigestDTO(chats, 0, 0.0, 0, 0);
        }

        return new UserDangerDigestDTO(
                chats,
                stats.getTotal(),
                stats.getAvg(),
                stats.getMax(),
                stats.getMin()
        );
    }
}
