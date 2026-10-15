package org.example.backend.dto;

/** The CSRF token the SPA must echo in {@code headerName} on every state-changing request. */
public record CsrfResponse(String headerName, String token) {
}
