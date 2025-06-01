package org.example.backend.dto;

public record UserDangerDigestDTO(
        long   totalChats,
        long   totalMessages,
        double averageDanger,
        int    worstDanger,
        int    safestDanger
) {}
