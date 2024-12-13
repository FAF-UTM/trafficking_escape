package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.converters.UserConverter;
import org.example.backend.dto.UserDTO;
import org.example.backend.service.UsersService;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Logger;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UsersController {

    private final UsersService service;
    private final UserConverter converter;

    private static final Logger LOGGER = Logger.getLogger(UsersController.class.getName());

    @GetMapping("/{id}")
    public UserDTO getUserById(@PathVariable Long id) {
        LOGGER.info("Entering getUserById with id: " + id);
        return converter.toDTO(service.findById(id));
    }

    @PostMapping("/register")
    public UserDTO registerUser(@RequestBody UserDTO userDTO) {
        LOGGER.info("Entering registerUser with userDTO: " + userDTO);
        return converter.toDTO(service.create(converter.toEntity(userDTO)));
    }

    @GetMapping("/{name}")
    public UserDTO getUserByName(@PathVariable String name) {
        LOGGER.info("Entering getUserByName with name: " + name);
        return converter.toDTO(service.findByUsername(name));
    }
}