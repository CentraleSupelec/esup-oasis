# --- Étape 1 : Build ---
FROM node:24-alpine AS build

WORKDIR /app

# On copie uniquement les fichiers de dépendances pour profiter du cache Docker
COPY package.json yarn.lock ./

# Installation des dépendances (frozen-lockfile pour garantir l'intégrité)
RUN yarn install --frozen-lockfile

COPY . .
ARG REACT_APP_VERSION=dev
ENV REACT_APP_VERSION=$REACT_APP_VERSION
RUN yarn build

# --- Étape 2 : Production ---
FROM caddy:alpine

WORKDIR /usr/share/caddy

# Copie des fichiers compilés
COPY --from=build /app/dist/ .

# Configuration Caddy (les {$REACT_APP_*} sont substitués nativement par Caddy au démarrage)
COPY docker/Caddyfile /etc/caddy/Caddyfile

# Script d'entrée
COPY --link --chmod=755 docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]