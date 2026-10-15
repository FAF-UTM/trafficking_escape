package org.example.backend.exceptions;

import lombok.Getter;

/** The language model could not produce a usable answer. */
@Getter
public class AiServiceException extends RuntimeException {

    /** Whether trying the same request again has a reasonable chance of succeeding. */
    private final boolean retryable;

    public AiServiceException(String message, boolean retryable) {
        super(message);
        this.retryable = retryable;
    }

    public AiServiceException(String message, boolean retryable, Throwable cause) {
        super(message, cause);
        this.retryable = retryable;
    }
}
