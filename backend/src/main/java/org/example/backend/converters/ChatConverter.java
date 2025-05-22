package org.example.backend.converters;

import org.mapstruct.InjectionStrategy;
import org.mapstruct.Mapper;
import org.example.backend.dto.ChatDTO;
import org.example.backend.model.Chat;

@Mapper(componentModel = "spring", injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public interface ChatConverter {
    Chat toEntity(ChatDTO dto);
    ChatDTO toDTO(Chat entity);
}
