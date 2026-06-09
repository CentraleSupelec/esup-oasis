# Développement

Pour installer les dépendances et démarrer l'application en mode développement, exécutez les commandes suivantes :

```bash
yarn install
yarn start
```

Ces commandes installent tous les packages nécessaires et lancent l'application en environnement de développement local,
où elle sera accessible par défaut à l'adresse http://localhost:3000.

## Utilisation de HTTPS/SSL en mode développement

Si votre environnement nécessite une connexion sécurisée via HTTPS/SSL (par exemple, en raison de la configuration de
votre CAS - Central Authentication Service), il est important de personnaliser la variable HOST dans le fichier
package.json.

### Démarrer l'application en mode HTTPS :

```json
{
  "start:https": "sudo HTTPS=true vite --host dev.esup-portail.org --port 443"
}
```

> Remarque : `sudo` est nécessaire sur certaines configurations pour exécuter le serveur sur le port 443.

Le site de développement est alors accessible à l'adresse https://dev.esup-portail.org.

```bash
yarn start:https
```

## Mettre à jour le `schema.d.ts`

Suite à une modification du backend, il peut être nécessaire de mettre à jour la définition TypeScript de l'API.

Pour ce faire, sur le backend :
```shell
bin/console api:openapi:export --yaml > ./OpenApi.yml
```
Côté frontend, récupérer le fichier `OpenApi.yml` et le placer dans le dossier `src/api`.
Éxécuter :
```shell
yarn run generate:api
```