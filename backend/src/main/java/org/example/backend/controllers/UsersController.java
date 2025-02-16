package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.converters.UserConverter;
import org.example.backend.dto.UserDTO;
import org.example.backend.model.User;
import org.example.backend.repos.UserRepository;
import org.example.backend.services.UsersService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.example.backend.security.JwtUtil;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UsersController {

    private final UsersService service;
    private final UserConverter converter;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Logger LOGGER = Logger.getLogger(UsersController.class.getName());

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public UserDTO getUserById(@PathVariable Long id) {
        LOGGER.info("Entering getUserById with id: " + id);
        return converter.toDTO(service.findById(id));
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public UserDTO getUserByName(@PathVariable String name) {
        LOGGER.info("Entering getUserByName with name: " + name);
        return converter.toDTO(service.findByUsername(name));
    }

    @PostMapping("/register")
    public UserDTO registerUser(@RequestBody UserDTO userDTO) {
        LOGGER.info("Entering registerUser with userDTO: " + userDTO);
        return converter.toDTO(service.create(converter.toEntity(userDTO)));
    }

    @PostMapping("/token")
    public ResponseEntity<?> generateToken(@RequestBody Map<String, String> loginData) {
        LOGGER.info("Attempting to generate token for user: " + loginData.get("username"));
        String username = loginData.get("username");
        String password = loginData.get("password");
        User user = userRepository.findByUsername(username);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            Map<String, Object> claims = new    HashMap<>();
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