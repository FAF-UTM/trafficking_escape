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

    private final ChatRepository    chatRepo;
    private final MessageRepository msgRepo;

    /** Linear score:  average −10 → 100,  0 → 50,  +10 → 1 */
    private int score(double avgDanger) {
        int s = (int) Math.round((-avgDanger + 10) * 5);  // 0-100
        return Math.max(1, Math.min(100, s));             // clamp
    }

    @Transactional(readOnly = true)
    public UserDangerDigestDTO build(Long userId) {

        long chats = chatRepo.countByUserId(userId);
        var  st    = msgRepo.aggregateForUser(userId);

        if (st == null) {        // user has no messages yet
            return new UserDangerDigestDTO(
                    100,         // perfect score by default
                    chats, 0, 0.0, 0, 0);
        }

        int score = score(st.getAvg());

        return new UserDangerDigestDTO(
                score,
                chats,
                st.getTotal(),
                st.getAvg(),
                st.getMax(),
                st.getMin()
        );
    }
}
