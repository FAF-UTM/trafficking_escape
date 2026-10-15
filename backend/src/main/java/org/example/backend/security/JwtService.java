package org.example.backend.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.example.backend.model.User;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;

/** Issues HS256-signed access tokens. Verification is done by Spring Security's resource server. */
@Service
public class JwtService {

    public static final String ID_CLAIM = "id";
    public static final String USERNAME_CLAIM = "username";
    public static final String ROLE_CLAIM = "role";

    private final JwtProperties properties;
    private final Clock clock;
    private final JwtEncoder encoder;

    public JwtService(JwtProperties properties, Clock clock) {
        this.properties = properties;
        this.clock = clock;
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(secretKey(properties)));
    }

    public record IssuedToken(String token, Instant expiresAt) {
    }

    public IssuedToken issue(User user) {
        Instant now = clock.instant();
        Instant expiresAt = now.plus(properties.ttl());
        // Tokens of ephemeral users never outlive the account itself.
        if (user.getExpirationDate() != null && user.getExpirationDate().isBefore(expiresAt)) {
            expiresAt = user.getExpirationDate();
        }

        // "id", "username" and "role" are read by the frontend (jwt-decode).
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .subject(user.getUsername())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim(ID_CLAIM, user.getId())
                .claim(USERNAME_CLAIM, user.getUsername())
                .claim(ROLE_CLAIM, user.getRole().name())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new IssuedToken(token, expiresAt);
    }

    static SecretKey secretKey(JwtProperties properties) {
        return new SecretKeySpec(properties.secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }
}
