#!/bin/bash

set -e  # detener el script si falla algo

echo "🔄 Limpiando front y nginx..."

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

echo "🔄🚀 Lanzando frontend..."
# Ejecutar el contenedor de front-end
cd ./csleaguesolution-frontend 
rm -rf node_modules package-lock.json
# 1. Limpiar cachés previas
docker builder prune -f

# 2. Construir con BuildKit habilitado
docker build --no-cache -t csleaguesolution/react-pwa-app:latest .

# 3. Ejecutar el contenedor
docker run -d --name react-pwa-container --network csleaguesolutionnetwork csleaguesolution/react-pwa-app:latest

echo "✅🚀 Frontend levantado correctamente."

cd ..
echo "🔄🚀 Levantando revers proxy... "
docker run -d --name nginx-proxy \
  --network csleaguesolutionnetwork \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v user_avatars:/usr/share/nginx/html/avatars \
  nginx:latest
echo "✅🚀 Todo levantado correctamente."

echo "ℹ️ Accede a http://localhost para visualizar la APP."
