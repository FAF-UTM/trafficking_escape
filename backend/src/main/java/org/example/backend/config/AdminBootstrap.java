package org.example.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.model.Role;
import org.example.backend.model.User;
import org.example.backend.repos.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * Creates the first admin account from ADMIN_USERNAME / ADMIN_PASSWORD when it does not exist yet.
 * Registration is admin-only, so this is how a fresh database gets its first admin.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.username:}")
    private String username;

    @Value("${app.bootstrap-admin.password:}")
    private String password;

    @Value("${app.bootstrap-admin.email:}")
    private String email;

    @Override
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            return;
        }
        if (userRepository.existsByUsername(username)) {
            return;
        }
        if (password.length() < 12) {
            log.warn("Bootstrap admin not created: ADMIN_PASSWORD must be at least 12 characters");
            return;
        }

        User admin = new User();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setEmail(StringUtils.hasText(email) ? email : username + "@admin.local");
        admin.setRole(Role.ROLE_ADMIN);
        userRepository.save(admin);
        log.info("Created bootstrap admin '{}'", username);
    }
}
