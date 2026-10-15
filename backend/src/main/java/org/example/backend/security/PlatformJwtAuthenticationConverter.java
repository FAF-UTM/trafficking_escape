package org.example.backend.security;

import org.example.backend.model.Role;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;

import java.util.List;

/** Turns a verified JWT into an authentication whose principal is a {@link PlatformUserDetails}. */
public class PlatformJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Object id = jwt.getClaim(JwtService.ID_CLAIM);
        String username = jwt.getClaimAsString(JwtService.USERNAME_CLAIM);
        Role role = parseRole(jwt.getClaimAsString(JwtService.ROLE_CLAIM));
        if (!(id instanceof Number number) || username == null) {
            throw new InvalidBearerTokenException("Token is missing required claims");
        }

        PlatformUserDetails principal = new PlatformUserDetails(number.longValue(), username, role);
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role.name()));
        return UsernamePasswordAuthenticationToken.authenticated(principal, jwt, authorities);
    }

    private static Role parseRole(String role) {
        try {
            return Role.valueOf(role);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidBearerTokenException("Token has an unknown role");
        }
    }
}
