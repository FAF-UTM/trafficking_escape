package org.example.backend.services;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.FeedbackRequest;
import org.example.backend.dto.FeedbackResponse;
import org.example.backend.model.Feedback;
import org.example.backend.repos.FeedbackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository repository;

    @Transactional
    public FeedbackResponse createFeedback(FeedbackRequest request) {
        Feedback feedback = new Feedback();
        feedback.setExperience(request.experience());
        feedback.setDifficulty(request.difficulty());
        feedback.setAwareness(request.awareness());
        feedback.setMinigames(request.minigames());
        feedback.setRecommend(request.recommend());
        feedback.setNavigation(request.navigation());
        return FeedbackResponse.from(repository.save(feedback));
    }
}
