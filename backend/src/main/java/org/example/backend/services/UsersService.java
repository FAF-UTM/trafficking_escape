package org.example.backend.services;

import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.CreatedUserResponse;
import org.example.backend.dto.RegisterUserRequest;
import org.example.backend.exceptions.ConflictException;
import org.example.backend.exceptions.NotFoundException;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repos.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Slf4j
@Service
public class UsersService {

    private static final String ACCESS_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int ACCESS_CODE_LENGTH = 6;
    private static final String USERNAME_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
    private static final int MAX_CODE_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public UsersService(UserRepository userRepository, PasswordEncoder passwordEncoder, Clock clock) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public List<User> findUsersCreatedBy(String createdBy) {
        return userRepository.findAllByCreatedByOrderByExpirationDateDesc(createdBy);
    }

    @Transactional
    public User register(RegisterUserRequest request, String createdBy) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ConflictException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEmail(request.email());
        user.setRole(request.role() != null ? request.role() : Role.ROLE_USER);
        user.setCreatedBy(createdBy);
        User saved = userRepository.save(user);
        log.info("User '{}' registered '{}' with role {}", createdBy, saved.getUsername(), saved.getRole());
        return saved;
    }

    /** Creates a user who signs in with a short access code until {@code validity} has passed. */
    @Transactional
    public CreatedUserResponse createEphemeralUser(Duration validity, String createdBy) {
        if (validity.isZero() || validity.isNegative()) {
            throw new IllegalArgumentException("validity must be positive");
        }
        Instant expirationDate = clock.instant().plus(validity);
        String accessCode = generateUniqueAccessCode();
        String username = "user_" + randomString(USERNAME_ALPHABET, 10);

        User user = new User();
        user.setUsername(username);
        // These accounts never use password login; store an unguessable, unrecoverable password.
        user.setPassword(passwordEncoder.encode(randomSecret()));
        user.setAccessCodeHash(passwordEncoder.encode(accessCode));
        user.setAccessCodeSha256(sha256Hex(accessCode));
        user.setRole(Role.ROLE_USER);
        user.setExpirationDate(expirationDate);
        user.setCreatedBy(createdBy);
        user.setEmail(username + "@temp.local");
        userRepository.save(user);

        log.info("Admin '{}' created ephemeral user '{}' expiring {}", createdBy, username, expirationDate);
        return new CreatedUserResponse(username, accessCode, expirationDate);
    }

    /** Looks the code up through its SHA-256 index, then confirms it against the BCrypt hash. */
    @Transactional(readOnly = true)
    public Optional<User> findActiveUserByAccessCode(String rawCode) {
        if (rawCode == null || rawCode.length() != ACCESS_CODE_LENGTH) {
            return Optional.empty();
        }
        String code = rawCode.toUpperCase(Locale.ROOT);
        Instant now = clock.instant();
        return userRepository.findByAccessCodeSha256(sha256Hex(code))
                .filter(u -> !u.isExpired(now))
                .filter(u -> u.getAccessCodeHash() != null && passwordEncoder.matches(code, u.getAccessCodeHash()));
    }

    private String generateUniqueAccessCode() {
        for (int attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
            String code = randomString(ACCESS_CODE_ALPHABET, ACCESS_CODE_LENGTH);
            if (!userRepository.existsByAccessCodeSha256(sha256Hex(code))) {
                return code;
            }
        }
        throw new IllegalStateException("Could not generate a unique access code");
    }

    private String randomString(String alphabet, int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(alphabet.charAt(random.nextInt(alphabet.length())));
        }
        return sb.toString();
    }

    private String randomSecret() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getEncoder().encodeToString(bytes);
    }

    private static String sha256Hex(String raw) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
