#!/bin/bash

set -e  # detener el script si falla algo

echo "🔄 Limpiando contenedores y red..."

# Función para detener y eliminar un contenedor si existe
clean_container() {
  local container=$1
  if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
    echo "🛑 Deteniendo contenedor: $container"
    docker stop "$container" > /dev/null
    echo "🗑️ Eliminando contenedor: $container"
    docker rm "$container" > /dev/null
  else
    echo "✅ Contenedor $container no existe. Saltando..."
  fi
}

# Limpiar contenedores
clean_container nginx-proxy
clean_container react-pwa-container
clean_container springboot-app
clean_container postgres

# Eliminar red si existe
if docker network ls --format '{{.Name}}' | grep -q "^csleaguesolutionnetwork$"; then
  echo "🧹 Eliminando red: csleaguesolutionnetwork"
  docker network rm csleaguesolutionnetwork > /dev/null
else
  echo "✅ Red csleaguesolutionnetwork no existe. Saltando..."
fi


# Crear red personalizada (ignorar si ya existe)
docker network create csleaguesolutionnetwork || true
# Crear volumen para datos (ignorar si ya existe)
docker volume inspect postgres_data >/dev/null 2>&1 || docker volume create postgres_data

echo "🔄 Iniciando contenedor PostgreSQL..."

docker run -d --name postgres --network csleaguesolutionnetwork \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=csleaguesolutiondb \
  -v postgres_data:/var/lib/postgresql/csleaguesolutiondb/data \
  -p 5432:5432 \
  postgres:16

echo "⏳ Esperando a que PostgreSQL esté listo..."

# Esperar activamente usando contenedor temporal
until docker run --rm --network csleaguesolutionnetwork \
  postgres:16 pg_isready -h postgres -U admin > /dev/null 2>&1; do
  echo "❌ PostgreSQL no está listo aún..."
  sleep 1
done

echo "✅ PostgreSQL está listo."

echo " Generando claves de despliegue y encriptación..." 

echo "🔄🚀 Lanzando backend..."

cd ./csleaguesolution-backend
# Ejecutar el contenedor de Spring Boot 
docker build --no-cache -t usuariocsleaguesolution/csleaguesolution-backend:latest .
docker run -d --name springboot-app --network csleaguesolutionnetwork \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/csleaguesolutiondb \
  -e SPRING_DATASOURCE_USERNAME=admin \
  -e SPRING_DATASOURCE_PASSWORD=admin123 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n' | tr -d '+/' | head -c 64) \
  -e JAVA_TOOL_OPTIONS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=0.0.0.0:5005" \
  -p 5005:5005 \
  usuariocsleaguesolution/csleaguesolution-backend:latest

echo "✅🚀 Backend levantado correctamente."
echo "🔄🚀 Lanzando frontend..."
# Ejecutar el contenedor de front-end
cd ../csleaguesolution-frontend 
rm -rf node_modules package-lock.json
# 1. Limpiar cachés previas
docker builder prune -f

# 2. Construir con BuildKit habilitado
docker build --no-cache -t usariocsleaguesolution/react-pwa-app:latest .

# 3. Ejecutar el contenedor
docker run -d --name react-pwa-container --network csleaguesolutionnetwork usariocsleaguesolution/react-pwa-app:latest

echo "✅🚀 Frontend levantado correctamente."

cd ..
echo "🔄🚀 Levantando revers proxy... "
docker run -d --name nginx-proxy \
  --network csleaguesolutionnetwork \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:latest
echo "✅🚀 Todo levantado correctamente."

echo "ℹ️  Accede a http://localhost/api/swagger-ui/index.html para ver el Swagger y a http://localhost/csleaguesolution para ver la GUI."
