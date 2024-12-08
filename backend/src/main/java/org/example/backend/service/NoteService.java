package org.example.backend.service;

import org.example.backend.dto.NoteDTO;
import org.example.backend.model.Note;
import org.example.backend.model.Type;
import org.example.backend.repos.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    public Page<NoteDTO> findAllNotes(int page, int size, Type type) {
        Pageable pageable = PageRequest.of(page, size);
        if (type != null) {
            return noteRepository.findByType(type, pageable).map(this::convertToDTO);
        } else {
            return noteRepository.findAll(pageable).map(this::convertToDTO);
        }
    }

    public NoteDTO findNoteById(Long id) {
        Note note = noteRepository.findById(id).orElseThrow(() -> new RuntimeException("Note not found"));
        return convertToDTO(note);
    }

    public NoteDTO saveOrUpdateNote(NoteDTO noteDTO) {
        Note note = noteRepository.save(convertToEntity(noteDTO));
        return convertToDTO(note);
    }

    public NoteDTO updateNote(Long id, NoteDTO noteDTO) {
        Note note = noteRepository.findById(id).orElseThrow(() -> new RuntimeException("Note not found"));
        note.setType(noteDTO.getType());
        note.setMessage(noteDTO.getMessage());
        note.setCompleted(noteDTO.isCompleted());
        note = noteRepository.save(note);
        return convertToDTO(note);
    }

    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }

    private NoteDTO convertToDTO(Note note) {
        NoteDTO noteDTO = new NoteDTO();
        noteDTO.setId(note.getId());
        noteDTO.setType(note.getType());
        noteDTO.setMessage(note.getMessage());
        noteDTO.setCompleted(note.getCompleted());
        return noteDTO;
    }

    private Note convertToEntity(NoteDTO noteDTO) {
        Note note = new Note();
        note.setId(noteDTO.getId());
        note.setType(noteDTO.getType());
        note.setMessage(noteDTO.getMessage());
        note.setCompleted(noteDTO.isCompleted());
        return note;
    }
}
