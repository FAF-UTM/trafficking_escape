package org.example.backend.converters;

import org.mapstruct.InjectionStrategy;
import org.mapstruct.Mapper;
import org.example.backend.dto.FeedbackDTO;
import org.example.backend.model.Feedback;

@Mapper(componentModel = "spring", injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public interface FeedbackConverter {
    Feedback toEntity(FeedbackDTO dto);
    FeedbackDTO toDTO(Feedback entity);
}