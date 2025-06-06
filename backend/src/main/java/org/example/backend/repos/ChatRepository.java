package org.example.backend.repos;

import org.example.backend.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByUserId(Long userId);

    long countByUserId(Long userId);
}
