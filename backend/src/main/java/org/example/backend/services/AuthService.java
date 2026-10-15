package org.example.backend.services;

import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.SessionResponse;
import org.example.backend.model.User;
import org.example.backend.repos.UserRepository;
import org.example.backend.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
public class AuthService {

    /** A signed-in user: the token goes into the session cookie, the session into the response body. */
    public record SignedIn(String token, Instant expiresAt, SessionResponse session) {
    }

    private final UserRepository userRepository;
    private final UsersService usersService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /** Compared against when the username is unknown, so response time does not reveal which usernames exist. */
    private final String dummyHash;

    public AuthService(UserRepository userRepository, UsersService usersService, PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.usersService = usersService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.dummyHash = passwordEncoder.encode("timing-equalisation-only");
    }

    @Transactional(readOnly = true)
    public SignedIn login(String username, String password) {
        User user = userRepository.findByUsername(username).orElse(null);
        boolean passwordMatches = passwordEncoder.matches(password, user != null ? user.getPassword() : dummyHash);

        // Ephemeral users sign in with their access code only; password login would bypass one-time codes.
        if (user == null || !passwordMatches || user.getExpirationDate() != null) {
            throw new BadCredentialsException("Invalid username or password");
        }
        return signIn(user);
    }

    @Transactional
    public SignedIn loginWithAccessCode(String code, boolean oneTime) {
        User user = usersService.findActiveUserByAccessCode(code)
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired code"));

        if (oneTime && userRepository.consumeAccessCode(user.getId()) == 0) {
            // Another request consumed the code between lookup and update.
            throw new BadCredentialsException("Invalid or expired code");
        }
        if (oneTime) {
            log.info("Consumed one-time access code of user id={}", user.getId());
        }
        return signIn(user);
    }

    private SignedIn signIn(User user) {
        JwtService.IssuedToken token = jwtService.issue(user);
        SessionResponse session = new SessionResponse(true, user.getId(), user.getUsername(), user.getRole().name(),
                token.expiresAt());
        return new SignedIn(token.token(), token.expiresAt(), session);
    }
}
