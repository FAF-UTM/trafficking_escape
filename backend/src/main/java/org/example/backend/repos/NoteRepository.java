package org.example.backend.repos;

import org.example.backend.model.Note;
import org.example.backend.model.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    Page<Note> findByType(Type type, Pageable pageable);
}
