package org.example.backend.controllers;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.CreatedUserResponse;
import org.example.backend.dto.CreatedUserSummary;
import org.example.backend.dto.RegisterUserRequest;
import org.example.backend.dto.UserResponse;
import org.example.backend.security.PlatformUserDetails;
import org.example.backend.services.UsersService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

/** User administration; every endpoint here is admin-only. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@PreAuthorize("hasRole('ADMIN')")
public class UsersController {

    private static final int MAX_VALIDITY_MINUTES = 30 * 24 * 60;

    private final UsersService service;

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return UserResponse.from(service.findById(id));
    }

    @GetMapping("/name/{name}")
    public UserResponse getUserByName(@PathVariable String name) {
        return UserResponse.from(service.findByUsername(name));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerUser(@Valid @RequestBody RegisterUserRequest request,
                                     @AuthenticationPrincipal PlatformUserDetails principal) {
        return UserResponse.from(service.register(request, principal.getUsername()));
    }

    /** Creates an ephemeral user; the access code in the response is shown only once. */
    @PostMapping("/random")
    public CreatedUserResponse createEphemeralUser(
            @RequestParam(defaultValue = "60") @Min(1) @Max(MAX_VALIDITY_MINUTES) long validityMinutes,
            @AuthenticationPrincipal PlatformUserDetails principal) {
        return service.createEphemeralUser(Duration.ofMinutes(validityMinutes), principal.getUsername());
    }

    @GetMapping("/created")
    public List<CreatedUserSummary> getUsersCreatedByMe(@AuthenticationPrincipal PlatformUserDetails principal) {
        return service.findUsersCreatedBy(principal.getUsername()).stream()
                .map(CreatedUserSummary::from)
                .toList();
    }
}
