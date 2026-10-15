package org.example.backend.exceptions;

import lombok.Getter;

import java.time.Duration;

@Getter
public class TooManyRequestsException extends RuntimeException {

    private final Duration retryAfter;

    public TooManyRequestsException(Duration retryAfter) {
        super("Too many requests");
        this.retryAfter = retryAfter;
    }
}
