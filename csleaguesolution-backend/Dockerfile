# =======================
# Etapa 1: Compilar con Maven
# =======================
FROM maven:3.9-eclipse-temurin-17 AS build

RUN mkdir -p /app/uploads/avatars
RUN chmod -R 777 /app/uploads/avatars

WORKDIR /app

COPY . .
RUN mvn clean package -DskipTests

# =======================
# Etapa 2: Imagen de runtime ligera
# =======================
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=12 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
