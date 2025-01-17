package org.example.service.checker.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InternalService {
    private String name;
    private String ip;
    private int port;
    private String healthEndpoint;
    private boolean isHealthy;
    private ServiceType serviceType;

    public enum ServiceType {
        STANDARD,
        DATABASE,
        GATEWAY
    }

    @Override
    public String toString() {
        return String.format("InternalService(name=%s, ip=%s, port=%d, healthEndpoint=%s, isHealthy=%s, serviceType=%s)",
                name, ip, port, healthEndpoint, isHealthy, serviceType);
    }
}