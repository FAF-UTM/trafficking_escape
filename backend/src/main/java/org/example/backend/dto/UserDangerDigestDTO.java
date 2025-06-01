package org.example.backend.dto;

public record UserDangerDigestDTO(
        int    score,
        long   totalChats,
        long   totalMessages,
        double averageDanger,
        int    worstDanger,
        int    safestDanger
) {}
