package org.example.backend.controllers;

import org.example.backend.dto.NoteDTO;
import org.example.backend.model.Type;
import org.example.backend.model.User;
import org.example.backend.repos.UserRepository;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private static final Logger LOGGER = Logger.getLogger(NoteController.class.getName());

    @Autowired
    private NoteService noteService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<Page<NoteDTO>> getAllNotes(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size,
                                                     @RequestParam(required = false) Type type) {
        Page<NoteDTO> notes = noteService.findAllNotes(page, size, type);
        return new ResponseEntity<>(notes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER') or hasAuthority('ROLE_VISITOR')")
    public ResponseEntity<NoteDTO> getNoteById(@PathVariable Long id) {
        NoteDTO noteDTO = noteService.findNoteById(id);
        return new ResponseEntity<>(noteDTO, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<NoteDTO> createOrUpdateNote(@RequestBody NoteDTO noteDTO) {
        NoteDTO savedNote = noteService.saveOrUpdateNote(noteDTO);
        return new ResponseEntity<>(savedNote, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_USER')")
    public ResponseEntity<NoteDTO> updateNote(@PathVariable Long id, @RequestBody NoteDTO noteDTO) {
        NoteDTO updatedNote = noteService.updateNote(id, noteDTO);
        return new ResponseEntity<>(updatedNote, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/token")
    public ResponseEntity<?> generateToken(@RequestBody Map<String, String> loginData) {
        LOGGER.info("Attempting to generate token for user: " + loginData.get("username"));

        String username = loginData.get("username");
        String password = loginData.get("password");
        User user = userRepository.findByUsername(username);

        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("username", user.getUsername());
            claims.put("role", user.getRole());

            String token = JwtUtil.generateToken(claims);
            LOGGER.info("Token generated successfully for user: " + username);
            return ResponseEntity.ok(token);
        }

        LOGGER.warning("Invalid login attempt for user: " + username);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid username or password");
    }
}
