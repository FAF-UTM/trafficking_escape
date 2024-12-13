package org.example.backend.repos;

import org.example.backend.model.ChatData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatDataRepository extends JpaRepository<ChatData, Long> {
}