# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist ./dist

# Variables de entorno por defecto
ENV PORT=3001
ENV HOST=0.0.0.0
ENV NODE_ENV=production

# Exponer puerto
EXPOSE 3001

# Iniciar aplicación
CMD ["node", "dist/server.js"]
