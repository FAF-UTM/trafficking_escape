package org.example.backend.converters;

public interface GenericConverter<T, U> {
    T toDTO(U entity);
    U toEntity(T dto);
}