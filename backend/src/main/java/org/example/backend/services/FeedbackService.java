package org.example.backend.services;

import lombok.RequiredArgsConstructor;
import org.example.backend.converters.FeedbackConverter;
import org.example.backend.dto.FeedbackDTO;
import org.example.backend.model.Feedback;
import org.example.backend.repos.FeedbackRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository repo;
    private final FeedbackConverter converter;

    public FeedbackDTO createFeedback(FeedbackDTO dto) {
        Feedback entity = converter.toEntity(dto);
        entity = repo.save(entity);
        return converter.toDTO(entity);
    }
}