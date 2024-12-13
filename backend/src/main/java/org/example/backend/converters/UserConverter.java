package org.example.backend.converters;

import org.mapstruct.InjectionStrategy;
import org.mapstruct.Mapper;

import org.example.backend.dto.UserDTO;
import org.example.backend.model.User;

@Mapper(componentModel = "spring", injectionStrategy = InjectionStrategy.CONSTRUCTOR)
public interface UserConverter {
    User toEntity(UserDTO dto);
    UserDTO toDTO(User entity);
}
