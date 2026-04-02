#!/bin/sh

#
# Copyright (c) 2026. Esup - Université de Bordeaux.
#
# This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
#  For full copyright and license information please view the LICENSE file distributed with the source code.
#
#  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
#
#

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

exec "$@"