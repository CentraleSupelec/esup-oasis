# --- Étape 1 : Build ---
FROM node:22.11-alpine AS build

WORKDIR /app

# On copie uniquement les fichiers de dépendances pour profiter du cache Docker
COPY package.json yarn.lock ./

# Installation des dépendances (frozen-lockfile pour garantir l'intégrité)
RUN yarn install --frozen-lockfile

# Copie du reste du code et build
COPY . .
RUN yarn build

# --- Étape 2 : Production ---
FROM nginx:alpine

# Installation de Node.js (version légère sur Alpine) uniquement pour react-inject-env
# Alternative : installer react-inject-env globalement ou copier node_modules sélectivement
RUN apk add --no-cache nodejs npm

WORKDIR /usr/share/nginx/html

# Copie des fichiers compilés
COPY --from=build /app/build/ .

# Configuration Nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Script d'entrée
COPY --link --chmod=755 docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint

# On s'assure que l'utilisateur nginx a les droits sur le dossier web
# (Nécessaire si on veut passer en mode non-root plus tard)
RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

EXPOSE 80

# On peut aussi envisager de passer en USER nginx ici,
# mais cela demande d'ajuster le port (>1024) et les permissions des dossiers de logs/cache de nginx.

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]