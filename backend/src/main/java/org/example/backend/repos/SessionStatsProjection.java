package org.example.backend.repos;

public interface SessionStatsProjection {
    Double getAvg();
    Integer getMax();
    Integer getMin();
    Long getTotal();
}
