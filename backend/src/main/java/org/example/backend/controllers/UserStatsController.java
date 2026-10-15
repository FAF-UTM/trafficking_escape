package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.UserDangerDigestDTO;
import org.example.backend.services.UserDigestService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserStatsController {

    private final UserDigestService digestService;

    @GetMapping("/{userId}/digest")
    @PreAuthorize("hasRole('ADMIN') or #userId == principal.id")
    public UserDangerDigestDTO digest(@PathVariable Long userId) {
        return digestService.build(userId);
    }
}
