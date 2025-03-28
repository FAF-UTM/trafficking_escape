package org.example.backend.converters;

import org.mapstruct.InjectionStrategy;
import org.mapstruct.Mapper;
import org.example.backend.dto.MessageDTO;
import org.example.backend.model.Message;

@Mapper(componentModel = "spring", injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public interface MessageConverter {
    Message toEntity(MessageDTO dto);
    MessageDTO toDTO(Message entity);
}
