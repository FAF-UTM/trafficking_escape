package org.example.backend.service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.model.ChatData;
import org.example.backend.repos.ChatDataRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@AllArgsConstructor
public class ChatDataService {
    private final ChatDataRepository chatDataRepository;

    public ResponseEntity<?> findAll() {
        return ResponseEntity.ok(chatDataRepository.findAll());
    }

    public ChatData findById(Long id) {
        return chatDataRepository.findById(id).orElse(null);
    }

    public ChatData create(ChatData chatData) {
        return chatDataRepository.save(chatData);
    }

    public void deleteById(Long id) {
        chatDataRepository.deleteById(id);
    }
}
