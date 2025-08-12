FROM gradle:8.9-jdk17-alpine AS build
WORKDIR /home/gradle/src
COPY --chown=gradle:gradle . .
RUN gradle build --no-daemon

FROM openjdk:17-jre-slim
WORKDIR /app

COPY --from=build /home/gradle/src/build/libs/*.jar ./app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]