# Production image. Build the jar first and place it next to this file:
#   mvn -DskipTests package && cp target/backend-*.jar .
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY *.jar app.jar
USER app

EXPOSE 8080
HEALTHCHECK --interval=1m --timeout=5s --start-period=1m \
  CMD wget -q -O /dev/null http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-Dspring.profiles.active=prod", "-jar", "/app/app.jar"]
