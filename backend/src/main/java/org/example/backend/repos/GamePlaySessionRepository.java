package org.example.backend.repos;

import org.example.backend.model.GamePlaySession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GamePlaySessionRepository extends JpaRepository<GamePlaySession, Long> {
}




