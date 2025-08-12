#!/bin/bash
set -e

echo "🔄 Reiniciando contenedores con nueva compilación..."

# Función para detener un contenedor si está corriendo
stop_container() {
  local container=$1
  if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
    echo "🛑 Deteniendo contenedor: $container"
    docker stop "$container" > /dev/null
  else
    echo "ℹ️ Contenedor $container no estaba en ejecución."
  fi
}

# Crear red y volumen si no existen
docker network inspect csleaguesolutionnetwork >/dev/null 2>&1 || docker network create csleaguesolutionnetwork
docker volume inspect postgres_data >/dev/null 2>&1 || docker volume create postgres_data
docker volume inspect user_avatars >/dev/null 2>&1 || docker volume create user_avatars

# PostgreSQL
stop_container postgres
docker build --pull --no-cache=false -t postgres:16 .
docker start postgres 2>/dev/null || docker run -d --name postgres --network csleaguesolutionnetwork \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=csleaguesolutiondb \
  -v postgres_data:/var/lib/postgresql/csleaguesolutiondb/dev/data \
  -p 5432:5432 \
  postgres:16

# Esperar hasta que esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
until docker exec postgres pg_isready -U admin > /dev/null 2>&1; do
  sleep 1
done
echo "✅ PostgreSQL listo."

# Backend
stop_container springboot-app
cd ./csleaguesolution-backend
docker build --no-cache -t usuariocsleaguesolution/csleaguesolution-backend:latest .
docker start springboot-app 2>/dev/null || docker run -d --name springboot-app --network csleaguesolutionnetwork \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/csleaguesolutiondb \
  -e SPRING_DATASOURCE_USERNAME=admin \
  -e SPRING_DATASOURCE_PASSWORD=admin123 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n' | tr -d '+/' | head -c 64) \
  -e JAVA_TOOL_OPTIONS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=0.0.0.0:5005" \
  -e AVATAR_UPLOAD_DIR=/app/uploads/avatars \
  -p 5005:5005 \
  -v user_avatars:/app/uploads/avatars \
  usuariocsleaguesolution/csleaguesolution-backend:latest
cd ..

# Frontend
stop_container react-pwa-container
cd ./csleaguesolution-frontend
docker build --no-cache -t usuariocsleaguesolution/react-pwa-app:latest .
docker start react-pwa-container 2>/dev/null || docker run -d --name react-pwa-container --network csleaguesolutionnetwork \
  usuariocsleaguesolution/react-pwa-app:latest
cd ..

# Reverse proxy
stop_container nginx-proxy
docker start nginx-proxy 2>/dev/null || docker run -d --name nginx-proxy \
  --network csleaguesolutionnetwork \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v user_avatars:/usr/share/nginx/html/avatars \
  nginx:latest

echo "✅ Todo levantado correctamente."
echo "ℹ️ Accede a http://localhost para visualizar la APP. http://localhost/api/swagger-ui/index.html y explorar /api/v3/api-docs para visualizar la API"
