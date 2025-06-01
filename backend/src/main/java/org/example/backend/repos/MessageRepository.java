package org.example.backend.repos;

import org.example.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatId(Long chatId);

    @Query("""
        SELECT AVG(m.dangerLevel) AS avg,
               MAX(m.dangerLevel) AS max,
               MIN(m.dangerLevel) AS min,
               COUNT(m)           AS total
          FROM Message m
          JOIN Chat c ON m.chatId = c.id
         WHERE c.userId = :userId
    """)
    SessionStatsProjection aggregateForUser(Long userId);
}
