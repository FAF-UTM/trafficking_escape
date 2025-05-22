package org.example.service.checker.config;

import org.example.service.checker.model.InternalService;
import org.example.service.checker.services.ServiceCheckerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class ServiceInitializer {

    private static final Logger logger = LoggerFactory.getLogger(ServiceInitializer.class);

    @Value("${SERVICES_TO_CHECK}")
    private String servicesToCheck;

    @Autowired
    private ServiceCheckerService serviceCheckerService;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeServices() {
        logger.info("Initializing services from SERVICES_TO_CHECK: {}", servicesToCheck);
        String[] services = servicesToCheck.split(",");
        for (String serviceInfo : services) {
            try {
                String[] parts = serviceInfo.trim().split("=");
                if (parts.length == 2) {
                    String name = parts[0].trim();
                    String[] addressParts = parts[1].trim().split(":");
                    if (addressParts.length >= 2) {
                        String ip = addressParts[0].trim();
                        String portAndEndpoint = addressParts[1].trim();
                        int port;
                        String healthEndpoint;

                        int slashIndex = portAndEndpoint.indexOf('/');
                        if (slashIndex != -1) {
                            port = parsePort(portAndEndpoint.substring(0, slashIndex));
                            healthEndpoint = portAndEndpoint.substring(slashIndex).trim();
                        } else {
                            port = parsePort(portAndEndpoint);
                            healthEndpoint = "/actuator/health";
                        }

                        if (port > 0) {
                            InternalService.ServiceType serviceType = determineServiceType(name);
                            InternalService internalService = new InternalService(name, ip, port, healthEndpoint, false, serviceType);
                            serviceCheckerService.addService(internalService);
                            logger.info("Added service: {}", internalService);
                        } else {
                            logger.warn("Invalid port number for service: {}", serviceInfo);
                        }
                    } else {
                        logger.warn("Invalid address format for service: {}", serviceInfo);
                    }
                } else {
                    logger.warn("Invalid service configuration format: {}", serviceInfo);
                }
            } catch (Exception e) {
                logger.error("Error processing service configuration: {}", serviceInfo, e);
            }
        }
        logger.info("Service initialization complete. Total services added: {}", serviceCheckerService.getAllServices().size());
    }

    private int parsePort(String portString) {
        try {
            return Integer.parseInt(portString.trim());
        } catch (NumberFormatException e) {
            logger.error("Invalid port number: {}", portString);
            return -1;
        }
    }

    private InternalService.ServiceType determineServiceType(String serviceName) {
        if ("db".equalsIgnoreCase(serviceName)) {
            return InternalService.ServiceType.DATABASE;
        } else if ("gateway".equalsIgnoreCase(serviceName)) {
            return InternalService.ServiceType.GATEWAY;
        } else {
            return InternalService.ServiceType.STANDARD;
        }
    }
}