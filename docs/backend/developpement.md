# Guide de développement Backend

Ce guide détaille les instructions pour mettre en place un environnement de développement pour le backend d'Oasis.

## Prérequis

- Docker et Docker Compose
- (Optionnel) PHP 8.4+ en local pour l'auto-complétion dans votre IDE

## Installation de l'environnement de développement

Le développement se fait principalement via Docker pour garantir la cohérence des environnements.

### 1. Build de l'image de développement

Utilisez le `Dockerfile-dev` qui inclut les outils nécessaires au développement (comme Xdebug).

```bash
docker build -t oasis-backend-dev -f Dockerfile-dev .
```

### 2. Lancement du conteneur

Pour développer efficacement, montez le code source en tant que volume :

```bash
docker run -it --rm \
  --add-host=host.docker.internal:host-gateway \
  -v $PWD:/app \
  -v $PWD/docker/xdebug-conf.ini:/usr/local/etc/php/conf.d/99-xdebug-conf.ini \
  -p 8000:80 \
  oasis-backend-dev
```

L'installation "tout-en-un" disponible dans le dossier [installation](../../installation) permet l'équivalent
en chargeant la configuration de développement :

```bash
docker-compose -f compose.yaml -f compose.dev.yaml up -d
```

Cette configuration ajoute automatiquement le volume des sources, active la configuration xdebug et démarre
un conteneur Mailhog comme smtp fictif.

### 3. Initialisation de la base de données

Une fois le conteneur lancé, vous pouvez initialiser ou mettre à jour la base de données :

```bash
# Créer la base de données
docker exec -it <nom_du_conteneur> php bin/console doctrine:database:create

# Jouer les migrations
docker exec -it <nom_du_conteneur> php bin/console doctrine:migrations:migrate
```

### 4. Données initiales (Fixtures)

Pour charger les données de démonstration et de configuration initiale :

```bash
docker exec -it <nom_du_conteneur> php bin/console app:init-db
```

*Note : Cette commande n'a d'effet que si la table des utilisateurs est vide.*

## Commandes utiles

- **Nettoyage du cache** : `php bin/console cache:clear`
- **Générer une migration** : `php bin/console make:migration`
- **Lancer les tests** : `php bin/phpunit`

## Standards de code

- Suivre les recommandations **PSR-12**.
- Utiliser des noms de variables et de fonctions explicites en anglais.
- Les commentaires et la documentation peuvent être en français.

## Débogage (Xdebug)

L'image de développement inclut Xdebug. La configuration fournie dans `docker/xdebug-conf.ini` est pré-configurée pour
tenter de se connecter à votre IDE sur l'hôte.
