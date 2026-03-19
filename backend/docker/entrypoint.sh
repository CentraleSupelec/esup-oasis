#!/bin/sh

# Dump de l'environnement
#composer dump-env prod

# force la création de la table de cache
php /app/bin/console app:test-cache

# Déclencher les migrations de schéma
php /app/bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

#générer les clés SSL si nécessaire
php /app/bin/console lexik:jwt:generate-keypair --skip-if-exists

# init des données si nécessaire
php /app/bin/console app:init-db

# init des états ESE stockés si nécessaire
php /app/bin/console app:calcul-etats-ese

# init champ gestionnaire si nécessaire
php /app/bin/console app:calcul-champ-gest

# init des rôles stockés si nécessaire
php /app/bin/console app:calcul-roles

# permissions
# https://symfony.com/doc/current/setup/file_permissions.html
#chown -R unit:unit  /application/var

HTTPDUSER=$(ps axo user,comm | grep -E '[a]pache|[h]ttpd|[_]www|[w]ww-data|[n]ginx' | grep -v root | head -1 | cut -d\  -f1)
setfacl -dR -m u:"$HTTPDUSER":rwX -m u:$(whoami):rwX /app/var
setfacl -R -m u:"$HTTPDUSER":rwX -m u:$(whoami):rwX  /app/var

exec "$@"