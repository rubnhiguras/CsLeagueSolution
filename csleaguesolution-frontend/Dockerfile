FROM node:18-alpine

WORKDIR /app

# Copiar primero solo los archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias (esta capa se cachea si no cambian las dependencias)
RUN npm install

# Copiar el resto de los archivos
COPY . .

EXPOSE 3000

CMD ["npm", "start"]