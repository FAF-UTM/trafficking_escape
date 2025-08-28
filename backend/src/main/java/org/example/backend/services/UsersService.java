package org.example.backend.services;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.model.User;
import org.example.backend.repos.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@AllArgsConstructor
public class UsersService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /* ---------------- Basic CRUD ---------------- */

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User create(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public void delete(User user) {
        userRepository.delete(user);
    }

    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> findUsersCreatedBy(String createdBy) {
        return userRepository.findAllByCreatedBy(createdBy);
    }

    /* ---------------- Random / Ephemeral Users ---------------- */

    private static final String ACCESS_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int ACCESS_CODE_LENGTH = 6;
    private static final SecureRandom RNG = new SecureRandom();

    public CreatedUser createRandomUser(Duration validity, String createdBy) {
        Objects.requireNonNull(validity, "validity");
        if (validity.isZero() || validity.isNegative()) {
            throw new IllegalArgumentException("validity must be positive");
        }
        return createRandomUser(Instant.now().plus(validity), createdBy);
    }

    public CreatedUser createRandomUser(Instant expirationDate, String createdBy) {
        Objects.requireNonNull(expirationDate, "expirationDate");
        if (expirationDate.isBefore(Instant.now())) {
            throw new IllegalArgumentException("expirationDate must be in the future");
        }

        String accessCode = generateAccessCode();
        String username = "user_" + System.currentTimeMillis() + "_" + accessCode;

        User u = new User();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(accessCode));           // Optionally: distinct password
        u.setAccessCodeHash(passwordEncoder.encode(accessCode));     // BCrypt (for timing‑safe match)
        u.setAccessCodeSha256(sha256Hex(accessCode));                // Deterministic index
        u.setRole("ROLE_USER");
        u.setExpirationDate(expirationDate);
        u.setCreatedBy(createdBy);
        // email must be set if not nullable; if ephemeral, generate a placeholder:
        u.setEmail(username + "@temp.local");

        userRepository.save(u);
        log.info("Created ephemeral user username='{}' expires='{}'", username, expirationDate);

        return new CreatedUser(username, accessCode, expirationDate);
    }

    /**
     * Returns active (non-expired) user matching raw access code or null.
     * Fast lookup via SHA256 column + BCrypt confirmation.
     */
    public User findActiveUserByAccessCode(String rawCode) {
        if (rawCode == null || rawCode.length() != ACCESS_CODE_LENGTH) return null;
        return userRepository.findByAccessCodeSha256(sha256Hex(rawCode))
                .filter(u -> u.getExpirationDate() == null || u.getExpirationDate().isAfter(Instant.now()))
                .filter(u -> u.getAccessCodeHash() != null && passwordEncoder.matches(rawCode, u.getAccessCodeHash()))
                .orElse(null);
    }

    /**
     * Invalidate (one-time use). Clears hashes so code cannot be reused.
     */
    public void invalidateAccessCode(User user) {
        user.setAccessCodeHash(null);
        user.setAccessCodeSha256(null);
        userRepository.save(user);
        log.info("Invalidated access code for user id={}", user.getId());
    }

    /* ---------------- Helpers ---------------- */

    private String generateAccessCode() {
        char[] buf = new char[ACCESS_CODE_LENGTH];
        for (int i = 0; i < ACCESS_CODE_LENGTH; i++) {
            buf[i] = ACCESS_CODE_ALPHABET.charAt(RNG.nextInt(ACCESS_CODE_ALPHABET.length()));
        }
        return new String(buf);
    }

    private String sha256Hex(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] dig = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(dig.length * 2);
            for (byte b : dig) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    /* ---------------- DTO ---------------- */

    @Getter
    @AllArgsConstructor
    public static class CreatedUser {
        private final String username;
        private final String accessCode;      // raw (return once)
        private final Instant expirationDate;
    }
}
