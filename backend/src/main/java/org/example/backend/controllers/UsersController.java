package org.example.backend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.converters.UserConverter;
import org.example.backend.dto.UserDTO;
import org.example.backend.model.User;
import org.example.backend.repos.UserRepository;
import org.example.backend.security.JwtUtil;
import org.example.backend.services.UsersService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
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

    /* ---------------- Existing Endpoints ---------------- */

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public UserDTO getUserById(@PathVariable Long id) {
        LOGGER.info("getUserById id=" + id);
        return converter.toDTO(service.findById(id));
    }

    @GetMapping("/name/{name}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public UserDTO getUserByName(@PathVariable String name) {
        LOGGER.info("getUserByName name=" + name);
        return converter.toDTO(service.findByUsername(name));
    }

    @PostMapping("/register")
    public UserDTO registerUser(@RequestBody UserDTO userDTO) {
        LOGGER.info("registerUser username=" + userDTO.getUsername());
        return converter.toDTO(service.create(converter.toEntity(userDTO)));
    }

    @PostMapping("/token")
    public ResponseEntity<?> generateToken(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        User user = userRepository.findByUsername(username);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            Map<String, Object> claims = new HashMap<>();
            claims.put("id", user.getId());
            claims.put("username", user.getUsername());
            claims.put("role", user.getRole());
            String token = JwtUtil.generateToken(claims);
            return ResponseEntity.ok(Map.of("token", token));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Invalid username or password"));
    }

    /* ---------------- New Endpoints ---------------- */

    /**
     * Create a random ephemeral user.
     * Optional query param validityMinutes (default 60).
     * Returns username, raw access code (ONE TIME), and expiration.
     */
    @PostMapping("/random")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createRandomEphemeralUser(
            @RequestParam(name = "validityMinutes", required = false, defaultValue = "60") long validityMinutes,
            Authentication authentication
    ) {
        if (validityMinutes <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "validityMinutes must be > 0"));
        }
        UsersService.CreatedUser created = service.createRandomUser(Duration.ofMinutes(validityMinutes), authentication.getName());
        return ResponseEntity.ok(Map.of(
                "username", created.getUsername(),
                "accessCode", created.getAccessCode(),
                "expirationDate", created.getExpirationDate()
        ));
    }

    @GetMapping("/created")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getUsersCreatedByMe(Authentication authentication) {
        String adminUsername = authentication.getName();
        List<User> users = service.findUsersCreatedBy(adminUsername);
        List<Map<String, Object>> data = users.stream()
                .map(u -> Map.of(
                        "username", u.getUsername(),
                        "expirationDate", u.getExpirationDate()
                ))
                .toList();
        return ResponseEntity.ok(data);
    }

    /**
     * Validate an access code and, if valid, issue a JWT. Optionally one-time use.
     * GET /api/v1/users/access-code/{code}
     * Response: { token, username, expiresAt }
     */
    @GetMapping("/access-code/{code}")
//    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> exchangeAccessCodeForToken(@PathVariable String code,
                                                        @RequestParam(name = "oneTime", required = false, defaultValue = "false")
                                                        boolean oneTime) {
        User user = service.findActiveUserByAccessCode(code);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Invalid or expired code"));
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("username", user.getUsername());
        claims.put("role", user.getRole());

        String token = JwtUtil.generateToken(claims);

        if (oneTime) {
            service.invalidateAccessCode(user);
        }

        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", user.getUsername(),
                "expiresAt", user.getExpirationDate(),
                "oneTimeConsumed", oneTime
        ));
    }
}
