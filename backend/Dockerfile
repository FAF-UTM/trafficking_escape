# Stage 1: Build the application
FROM maven:3.8.1-openjdk-17 AS builder

# Set the working directory
WORKDIR /app

# Copy the Maven project file and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Package the application, skipping tests for faster builds
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM openjdk:17-slim

# Set the working directory
WORKDIR /app

# Copy the packaged jar file from the builder stage
COPY --from=builder /app/target/*.jar /app.jar

# Expose necessary ports
EXPOSE 8080
EXPOSE 5005

# Healthcheck to monitor the application's health
HEALTHCHECK --interval=1m --timeout=10s --start-period=30s \
  CMD wget -q -O- http://localhost:8080/actuator/health || exit 1

# Run the application with debugging enabled
CMD ["java", "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005", "-jar", "/app.jar"]
