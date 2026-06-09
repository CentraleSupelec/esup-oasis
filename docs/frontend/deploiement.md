# Déploiement

Le déploiement est recommandé via **Docker**. Un fichier `compose.yml` avec le `Dockerfile` associé sont fournis à titre
d'exemple. Node.js 24 (LTS - Long Term Support) est utilisé pour construire l'image Docker.

## Build

Pour construire l'image Docker de l'application, exécutez la commande suivante :

```bash
docker build -t oasis-frontend .
```

La version de l'application est injectée au moment du build via le `build-arg` `REACT_APP_VERSION`. Dans le workflow CI,
cette valeur est automatiquement renseignée depuis le tag git. Pour un build manuel :

```bash
docker build --build-arg REACT_APP_VERSION=v2.3.0 -t oasis-frontend .
```

La valeur par défaut est `dev` si le `build-arg` n'est pas fourni.

## Démarrage

Pour exécuter l'image Docker et vérifier que le service fonctionne correctement, vous pouvez utiliser la commande
suivante en lui fournissant la liste des [variables d'environnement nécessaires](configuration-environnement.md) :

```bash
docker run -p [port-hote]:80 \
    -e REACT_APP_ENVIRONMENT=local \
    -e REACT_APP_API=https://api.esup-portail.org \
    -e REACT_APP_FRONTEND=https://oasis.esup-portail.org \
    -e REACT_APP_OAUTH_CLIENT_ID=oasis \
    -e REACT_APP_OAUTH_PROVIDER=https://cas.esup-portail.org/cas/oauth2.0/authorize \
    -e REACT_APP_PHOTO=true \
    -e REACT_APP_PHOTO_DEMO=true \
    --name oasis-frontend \
  oasis-frontend
```

Cette commande démarre le conteneur et mappe le port 80 du conteneur au port `[port-hote]` de la machine hôte, rendant
ainsi l'application accessible via http://localhost:[port-hote] ou via l'adresse IP de l'hôte.
