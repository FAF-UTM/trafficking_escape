// controller/UserStatsController.java
package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.UserDangerDigestDTO;
import org.example.backend.services.UserDigestService;
import org.example.backend.security.PlatformUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserStatsController {

    private final UserDigestService digestService;

    @GetMapping("/{userId}/digest")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or #userId == principal.id")
    public UserDangerDigestDTO digest(
            @PathVariable Long userId,
            @AuthenticationPrincipal PlatformUserDetails principal) {

        boolean self = principal.getId().equals(userId);
        boolean admin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!(self || admin)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your data");
        }

        return digestService.build(userId);
    }
}
