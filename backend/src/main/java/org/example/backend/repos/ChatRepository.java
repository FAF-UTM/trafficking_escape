package org.example.backend.repos;

import org.example.backend.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {

    List<Chat> findByUserIdOrderByCreatedAtAsc(Long userId);

    Optional<Chat> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
