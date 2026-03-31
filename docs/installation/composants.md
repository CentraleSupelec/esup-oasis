# Composants de l'installation "tout-en-un"

L'installation "tout-en-un" comprend les composants suivants :

* le frontend
* le backend
* le serveur de base de données postgres
* Un reverse proxy caddy
* un antivirus clamav
* un service d'édition pdf gotenberg

En activant le mode test/développement, on a également un service Mailhog (smtp fictif).

## Le reverse proxy caddy

Son rôle est de distribuer les requêtes HTTP vers le backend et le frontend. Par convention, nous avons choisi de mettre
le frontend à la racine et le backend sur l'endpoint /api.

Vous aurez donc l'interface utilisateur accessible directement à l'url https://votre-domaine-oasis, et l'interface
swagger ui du backend à l'url https://votre-domaine-oasis/api/.

Si vous souhaitez utiliser des noms de domaines différents, modifier l'endpoint du backend... vous pouvez modifier le
fichier [Caddyfile](../../installation/caddy/Caddyfile) présent dans le
dossier [installation/caddy](../../installation/caddy) pour l'adapter à votre installation. N'oubliez pas dans ce cas
d'adapter également les variables d'environnement dans le fichier .env pour refléter vos choix (FRONT_URL, BACK_URL,
REACT_APP_API_PREFIX...).

Si vous disposez déjà d'un reverse proxy configuré pour vos besoins, vous pouvez simplement retirer la section dédiée
à Caddy dans le fichier [compose.yaml](../../installation/compose.yaml).

> [!CAUTION]
> Par défaut avec la configuration livrée caddy génère au démarrage un certificat auto-signé. Vous pouvez le remplacer
> par un certificat valide en suivant la documentation de caddy : https://caddyserver.com/docs/caddyfile/directives/tls.
>
> Cela revient pour une installation classique à modifier la ligne
>
> `tls internal`
>
> en
>
> `tls <fichier_certificat> <fichier_clé>`
>

## Le serveur de bases de données

Oasis utilise postgresql. On vous propose ici une installation locale, mais vous pouvez aussi utiliser un serveur
externe. Dans ce cas, vous devrez adapter les variables d'environnement dans le fichier .env pour refléter vos choix.

Au lieu des variables POSTGRES_* proposées dans le fichier .env.exemple, vous pouvez renseigner directement une variable
DATABASE_URL telle qu'attendue par le backend (postgres://user:password@host:port/dbname).

> [!CAUTION]
> Si vous conservez l'installation locale, n'oubliez pas les sauvegardes ! Vous pouvez utiliser les commandes classiques
> disponibles pour postgres via docker, par exemple pour un dump complet avec l'utilisateur/mot de passe par défaut :
> ```
> docker exec -t oasis-postgres pg_dump -U app -d app > /tmp/backup.sql
> ```

## Antivirus clamav

L'image docker utilisée inclut un processus de mise à jour automatique de la base de signatures virus. Elle est mise à
jour automatiquement et ne nécessite pas d'intervention.

Si vous disposez déjà d'une instance de clamav, vous pouvez désactiver le service dans le
fichier [compose.yaml](../../installation/compose.yaml) en commentant la section correspondante et en renseignant
la variable CLAMAV_SERVER dans le fichier .env.

## Gotenberg

Gotenberg est un service qui permet à Oasis de générer des documents PDF à partir de templates HTML.

Si vous disposez déjà d'une instance, vous pouvez désactiver le service dans le
fichier [compose.yaml](../../installation/compose.yaml) en commentant la section correspondante et en renseignant
la variable GOTENBERG_DSN dans le fichier .env.

## Mailhog

Mailhog est un serveur smtp fictif, permettant en mode test/dev de consulter tous les messages envoyés par l'application
sans réellement spammer les usagers.

L'interface de consultation est disponible sur le port 8025 du serveur.