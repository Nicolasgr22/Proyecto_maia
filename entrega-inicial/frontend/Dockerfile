# ── Etapa 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm ci

# Copiar fuentes y construir
COPY . .

# La URL del API se pasa como build arg (ver README para instrucciones)
ARG VITE_API_BASE_URL=http://localhost:8001
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Etapa 2: Serve ───────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Instalar el paquete 'serve' globalmente
RUN npm install -g serve

# Copiar los artefactos del build
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
