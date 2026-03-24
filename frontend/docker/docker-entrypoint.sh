#!/bin/sh

# Injecter les variables d'environnement dans le fichier env.js
npx --loglevel error react-inject-env set --dir /usr/share/nginx/html

# Exécuter Nginx
exec nginx -g "daemon off;"