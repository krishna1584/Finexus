# Build first: mvn -pl User-Service package -DskipTests
# (the official openjdk images are deprecated; Eclipse Temurin is the maintained replacement)
FROM eclipse-temurin:17-jre

COPY target/userservice-0.0.1-SNAPSHOT.jar /app/userservice.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "/app/userservice.jar"]
