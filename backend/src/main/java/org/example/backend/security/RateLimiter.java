package org.example.backend.security;

import org.example.backend.exceptions.TooManyRequestsException;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Fixed-window, in-memory rate limiter. Good enough for a single backend instance;
 * move to Redis (e.g. Bucket4j) if the backend is ever scaled horizontally.
 */
@Component
public class RateLimiter {

    public enum Limit {
        LOGIN(10, Duration.ofMinutes(1)),
        ACCESS_CODE(10, Duration.ofMinutes(1)),
        GAMEPLAY(60, Duration.ofMinutes(1)),
        AI_GENERATION(20, Duration.ofMinutes(1));

        private final int maxRequests;
        private final Duration window;

        Limit(int maxRequests, Duration window) {
            this.maxRequests = maxRequests;
            this.window = window;
        }
    }

    private static final int MAX_TRACKED_KEYS = 100_000;

    private final Clock clock;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimiter(Clock clock) {
        this.clock = clock;
    }

    /** Counts one request for {@code key} and throws when the limit for the current window is exceeded. */
    public void check(Limit limit, String key) {
        long now = clock.millis();
        if (windows.size() > MAX_TRACKED_KEYS) {
            windows.values().removeIf(w -> w.isOver(now));
        }

        Window window = windows.compute(limit.name() + ':' + key, (k, existing) ->
                existing == null || existing.isOver(now) ? new Window(now + limit.window.toMillis()) : existing);
        if (window.count.incrementAndGet() > limit.maxRequests) {
            throw new TooManyRequestsException(Duration.ofMillis(window.resetAt - now));
        }
    }

    private static final class Window {
        private final long resetAt;
        private final AtomicInteger count = new AtomicInteger();

        private Window(long resetAt) {
            this.resetAt = resetAt;
        }

        private boolean isOver(long now) {
            return now >= resetAt;
        }
    }
}
