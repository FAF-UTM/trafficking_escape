package org.example.backend.repos;

import org.example.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByChatIdOrderBySentAtAscIdAsc(Long chatId);

    List<Message> findByChatIdInOrderBySentAtAscIdAsc(Collection<Long> chatIds);

    /** Most recent messages first; callers reverse them for chronological order. */
    List<Message> findTop30ByChatIdOrderBySentAtDescIdDesc(Long chatId);

    @Query("""
            SELECT AVG(m.dangerLevel) AS avg,
                   MAX(m.dangerLevel) AS max,
                   MIN(m.dangerLevel) AS min,
                   COUNT(m.dangerLevel) AS total
              FROM Message m
              JOIN Chat c ON m.chatId = c.id
             WHERE c.userId = :userId
            """)
    SessionStatsProjection aggregateForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m JOIN Chat c ON m.chatId = c.id WHERE c.userId = :userId")
    long countForUser(@Param("userId") Long userId);
}
