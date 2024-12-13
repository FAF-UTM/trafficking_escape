package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.converters.ChatDataConverter;
import org.example.backend.converters.GenericConverter;
import org.example.backend.dto.ChatDataDTO;
import org.example.backend.service.ChatDataService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.logging.Logger;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ChatData")
public class ChatDataController {
    private final ChatDataService service;
    private final ChatDataConverter converter;


    private static final Logger LOGGER = Logger.getLogger(UsersController.class.getName());


    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ChatDataDTO getChatDataById(@PathVariable Long id) {
        LOGGER.info("Entering getChatDataById with id: " + id);
        return converter.toDTO(service.findById(id));
    }
}
