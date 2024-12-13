package org.example.backend.converters;

import org.example.backend.dto.ChatDataDTO;
import org.example.backend.model.ChatData;
import org.mapstruct.InjectionStrategy;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public interface ChatDataConverter extends GenericConverter<ChatDataDTO, ChatData> {
}
