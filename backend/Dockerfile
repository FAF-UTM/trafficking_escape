## Use the Maven image with JDK 17 so that Maven is available at runtime.
#FROM maven:3.8.1-openjdk-17
#
## Set the working directory.
#WORKDIR /app
#
## Copy the Maven project file and source code into the container.
## (You may want to use a .dockerignore file to avoid copying unnecessary files.)
#COPY pom.xml .
#COPY src ./src
#
## Expose the necessary ports.
#EXPOSE 8080
#EXPOSE 5005
#
## Healthcheck to monitor the application's health.
#HEALTHCHECK --interval=1m --timeout=10s --start-period=30s \
#  CMD wget -q -O- http://localhost:8080/actuator/health || exit 1
#
## On container startup, run a Maven clean build (which deletes previous build artifacts)
## and then start the application with debugging enabled.
#CMD ["bash", "-c", "mvn clean package -DskipTests && java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 -jar target/*.jar"]

# Use the Maven image with JDK 17 so that Maven is available at runtime.
FROM maven:3.8.1-openjdk-17
EXPOSE 8080
HEALTHCHECK --interval=5m --timeout=5s --start-period=5m CMD wget -nv -t1 --spider http://localhost:8080/actuator/health || exit 1
COPY *.jar /app.jar
#RUN mkdir -p "/app/layouts/img/"
#COPY src/main/resources/layouts/img/ /app/layouts/img/
CMD ["java", "-jar", "-Dspring.profiles.active=prod", "-Xverify:none", "-noverify", "/app.jar"]
