package org.example.backend.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.AccessCodeRequest;
import org.example.backend.dto.LoginRequest;
import org.example.backend.dto.SessionResponse;
import org.example.backend.security.AuthCookies;
import org.example.backend.security.RateLimiter;
import org.example.backend.services.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Sign-in endpoints. Both set the HttpOnly session cookie; the token never appears in a response body. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class AuthController {

    private final AuthService authService;
    private final AuthCookies authCookies;
    private final RateLimiter rateLimiter;

    @PostMapping("/token")
    public ResponseEntity<SessionResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        rateLimiter.check(RateLimiter.Limit.LOGIN, http.getRemoteAddr());
        rateLimiter.check(RateLimiter.Limit.LOGIN, "user:" + request.username());
        return withCookie(authService.login(request.username(), request.password()));
    }

    @PostMapping("/access-code")
    public ResponseEntity<SessionResponse> loginWithAccessCode(@Valid @RequestBody AccessCodeRequest request,
                                                               HttpServletRequest http) {
        rateLimiter.check(RateLimiter.Limit.ACCESS_CODE, http.getRemoteAddr());
        return withCookie(authService.loginWithAccessCode(request.code(), request.oneTime()));
    }

    private ResponseEntity<SessionResponse> withCookie(AuthService.SignedIn signedIn) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookies.session(signedIn.token(), signedIn.expiresAt()).toString())
                .body(signedIn.session());
    }
}
