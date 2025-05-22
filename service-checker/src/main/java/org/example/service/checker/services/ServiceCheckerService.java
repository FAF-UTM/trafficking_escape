package org.example.service.checker.services;

import lombok.extern.slf4j.Slf4j;
import org.example.service.checker.model.InternalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class ServiceCheckerService {

    private static final String ANSI_RESET = "\u001B[0m";
    private static final String ANSI_GREEN = "\u001B[32m";
    private static final String ANSI_RED = "\u001B[31m";
    private static final String ANSI_YELLOW = "\u001B[33m";

    private List<InternalService> services = new ArrayList<>();

    @Autowired
    private RestTemplate restTemplate;

    public List<InternalService> getAllServices() {
        return services;
    }

    public InternalService addService(InternalService service) {
        services.add(service);
        return service;
    }

    @Scheduled(fixedRateString = "${service-checker.check-interval}")
    public List<InternalService> checkAllServicesHealth() {
        log.info(ANSI_YELLOW + "=== Service Health Check Start ===" + ANSI_RESET);
        for (InternalService service : services) {
            checkServiceHealth(service);
        }
        log.info(ANSI_YELLOW + "=== Service Health Check Complete ===" + ANSI_RESET);
        return services;
    }

    private void checkServiceHealth(InternalService service) {
        boolean isHealthy;
        String errorMessage = null;

        try {
            switch (service.getServiceType()) {
                case DATABASE:
                case GATEWAY:
                    isHealthy = pingService(service.getIp(), service.getPort());
                    break;
                case STANDARD:
                default:
                    String url = String.format("http://%s:%d%s", service.getIp(), service.getPort(), service.getHealthEndpoint());
                    restTemplate.getForEntity(url, String.class);
                    isHealthy = true;
                    break;
            }
        } catch (Exception e) {
            isHealthy = false;
            errorMessage = e.getMessage();
        }

        service.setHealthy(isHealthy);
        logServiceHealth(service, errorMessage);
    }

    private boolean pingService(String ip, int port) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(ip, port), 5000); // 5 seconds timeout
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void logServiceHealth(InternalService service, String errorMessage) {
        String status = service.isHealthy() ? "HEALTHY" : "UNHEALTHY";
        String color = service.isHealthy() ? ANSI_GREEN : ANSI_RED;
        String logMessage = String.format("%-20s : %s", service.getName(), status);
        log.info(color + logMessage + ANSI_RESET);

        if (errorMessage != null) {
            log.error("Error details for {}: {}", service.getName(), errorMessage);
        }
    }
}