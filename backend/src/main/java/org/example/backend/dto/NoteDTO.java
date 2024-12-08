package org.example.backend.dto;

import lombok.Data;
import org.example.backend.model.Type;

@Data
public class NoteDTO {
    private Long id;
    private Type type;
    private String message;
    private boolean completed;
}