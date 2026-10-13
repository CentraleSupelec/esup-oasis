# Installation d'OASIS à l'université Paris-Saclay

OASIS est un progiciel édité par l'université de Bordeaux. Paris-Saclay l'installe sans en
modifier le code : ce qui lui est propre (configuration, requêtes Apogée, gabarit du PAEH) est
rassemblé dans le dossier `installation/`, et copié dans les images au moment de leur
construction.

Cette notice s'adresse à l'équipe qui installe et exploite OASIS. Elle suit l'ordre de
l'installation, puis détaille chaque fonctionnalité propre à Paris-Saclay.

> Notice en cours de rédaction. Les passages marqués **À compléter** attendent une information
> ou une décision.

## Avant de commencer

### Version d'OASIS

OASIS s'installe à partir des images publiées par Bordeaux sur `ghcr.io`. Les fichiers de
`installation/` ne font que leur ajouter la personnalisation de Paris-Saclay : rien n'est compilé
sur le serveur.

Les fonctionnalités de Paris-Saclay demandent des évolutions qui ne sont pas encore toutes dans une
version publiée :

| Évolution | État chez Bordeaux |
| --- | --- |
| Personnalisation copiée dans le worker (gabarit du PAEH, requêtes Apogée) | intégrée, pas encore publiée |
| Observations et date de l'avis médical sur le PAEH | intégrée, pas encore publiée |
| Signature électronique et connecteur FAST | à proposer |

**À compléter :** version d'OASIS à installer.

### Ce qu'il faut obtenir

| Élément | Auprès de | Pour |
| --- | --- | --- |
| Un serveur avec Docker Engine et Docker Compose v2, 4 Go de mémoire au moins | DSI | l'application ; l'antivirus occupe à lui seul environ 2 Go |
| Un nom DNS et son certificat HTTPS | DSI | sans certificat, le serveur web en génère un auto-signé |
| Un client OAuth2 « OASIS » dans le CAS de l'UPS : identifiant, secret, adresse de retour `https://<nom DNS>/callback` | DSI | la connexion des utilisateurs |
| Un compte de lecture de l'annuaire LDAP | DSI | la recherche des personnes |
| Un compte de lecture Apogée, et l'accès réseau à sa base | DSI, scolarité | l'import des inscriptions |
| Un relais SMTP | DSI | les e-mails ; sans lui, aucun n'est envoyé |
| Le certificat de dépôt FAST et les identifiants des circuits | chargé de projet FAST | la signature électronique |
| Le logo de l'UPS en couleurs d'écran (RVB), en SVG ou PNG, un petit logo en PNG, et un favicon | communication | l'interface, le PAEH et les e-mails |
| Un accès sortant vers `ghcr.io` et vers FAST, en HTTPS | DSI | les images, et la signature |

## Étape 1 : récupérer le code et la personnalisation

```bash
git clone https://github.com/EsupPortail/esup-oasis.git
cd esup-oasis
git checkout <version>
```

Copier ensuite, par-dessus, le dossier `installation/` de Paris-Saclay : la personnalisation du
backend et du frontend, et cette notice.

**À compléter :** dépôt de référence de la personnalisation de Paris-Saclay. Elle se trouve
aujourd'hui sur la branche `saclay/installation` du dépôt de CentraleSupélec : le `main` de Bordeaux,
plus le dossier `installation/` de Paris-Saclay, sans autre modification du code.

**Logo et favicon.** Les déposer avant la construction des images :

| Fichier | Dossier | Affiché |
| --- | --- | --- |
| le logo, en SVG ou PNG | `installation/backend/personnalisation/public/images/` | en tête du PAEH et des e-mails |
| le même fichier, sous le même nom | `installation/frontend/personnalisation/images/` | sur la page de connexion |
| un petit logo en PNG | `installation/backend/personnalisation/public/images/` | en pied des e-mails |
| `favicon.ico` | `installation/frontend/personnalisation/` | dans l'onglet du navigateur |

Les noms des deux logos se reportent dans `APP_LOGO` et `APP_LOGO_FOOTER_MAILS` (étape 2). Sans
favicon, la construction de l'image du frontend échoue.

La version « CMJN » du logo est faite pour l'imprimerie : ses couleurs s'affichent mal à l'écran et
dans le PDF. Prendre la version « RVB » en assez grande taille (au moins 600 pixels de large), ou
convertir la version CMJN, par exemple sur un Mac :
`sips -m "/System/Library/ColorSync/Profiles/sRGB Profile.icc" -s format png logo-CMJN.jpg --out logo.png`. Les fichiers sont copiés dans les images à la
construction : après un changement de logo, reconstruire (étape 5).

## Étape 2 : configurer `installation/.env`

```bash
cd installation
cp .env.exemple .env
```

Renseigner ensuite les variables ci-dessous. Les autres gardent leur valeur d'exemple.

**Serveur et secrets**

| Variable | Valeur |
| --- | --- |
| `APP_VERSION` | la version choisie à l'étape 1 |
| `SERVER_NAME` | le nom DNS ; `FRONT_URL`, `BACK_URL` et `REACT_APP_*` en sont déduites |
| `APP_SECRET` | une valeur aléatoire, par exemple `openssl rand -hex 32` |
| `POSTGRES_PASSWORD` | une valeur aléatoire ; ne pas garder `!ChangeMe!` |
| `JWT_PASSPHRASE` | une valeur aléatoire ; celle de l'exemple est publique |
| `JWT_COOKIE_DOMAIN` | le domaine du serveur |
| `MAILER_DSN` | `smtp://<relais>:<port>` ; absente du fichier d'exemple, à ajouter |
| `STORAGE_BASE_PATH` | `/var/oasis/fichiers`, voir l'étape 3 |
| `CLAMAV_STRICT_MODE` | `false` au premier démarrage, le temps que l'antivirus charge sa base, puis `true` |

**Identité de l'établissement**

```dotenv
APP_ETABLISSEMENT="Université Paris-Saclay"
APP_ETABLISSEMENT_ARTICLE="l'Université Paris-Saclay"
APP_DECISION_ETAB_LIB="PAEH"
APP_DECISION_ETAB_ARTICLE="le"
APP_LOGO="/images/<logo>.svg"
APP_LOGO_FOOTER_MAILS="/images/<petit logo>.png"
```

Sans ces valeurs, l'interface et les documents affichent celles de l'exemple.

**À compléter :** abréviation de l'établissement, nom et adresse du service, coordonnées du
délégué à la protection des données (`APP_ETABLISSEMENT_ABV*`, `APP_SERVICE*`, `APP_EMAIL_SERVICE`,
`APP_ADRESSE_DPD`, `APP_EMAIL_DPD`), couleurs de l'interface.

**Connexion par le CAS**

| Variable | Valeur |
| --- | --- |
| `OAUTH_CLIENTID`, `OAUTH_CLIENTSECRET` | le client OAuth2 créé dans le CAS |
| `OAUTH_REDIRECTURI` | `https://<nom DNS>/callback` |
| `OAUTH_URLAUTHORIZE`, `OAUTH_URLACCESSTOKEN`, `OAUTH_URLRESOURCEOWNERDETAILS` | `<adresse du CAS>/oauth2.0/authorize`, `/token` et `/profile` |
| `REACT_APP_OAUTH_CLIENT_ID` | l'identifiant du client |
| `REACT_APP_OAUTH_PROVIDER` | `<adresse du CAS>/oauth2.0/authorize` |

**Annuaire et Apogée**

| Variable | Valeur |
| --- | --- |
| `LDAP_*` | **À compléter** avec la DSI |
| `SI_SCOL` | `APOGEE` |
| `APOGEE_USER`, `APOGEE_PWD`, `APOGEE_DB` | le compte de lecture, et la base au format `//serveur:port/sid` |

Les variables `APOGEE_REQUETE_*` gardent leur valeur : les requêtes de Paris-Saclay remplacent
celles de l'application dans l'image.

**Signature électronique :** voir la section [Signature électronique](#signature-électronique-fast-parapheur).

Après toute modification de `.env`, `docker compose up -d` recrée les conteneurs concernés. Un
simple redémarrage ne relit pas le fichier.

## Étape 3 : adapter `compose.yaml`

**Stockage des documents.** Par défaut, OASIS range les documents dans `/tmp`, à l'intérieur de
chaque conteneur. Ils sont alors perdus à chaque redéploiement, et ceux que range le worker, comme
la copie du PAEH envoyé, restent invisibles pour le backend. Monter un même volume dans les deux :

```yaml
services:
  backend:
    volumes:
      - oasis-fichiers:/var/oasis/fichiers
  backend-worker:
    volumes:
      - oasis-fichiers:/var/oasis/fichiers

volumes:
  oasis-fichiers:
```

Ajouter ces lignes à celles qui existent déjà. À vérifier à la première installation : un document
téléversé apparaît bien dans le volume.

**Certificat HTTPS.** Dans `caddy/Caddyfile`, remplacer `tls internal` par
`tls <fichier du certificat> <fichier de la clé>`, et monter ces deux fichiers dans le service
`caddy`.

**Certificat FAST :** voir la section [Signature électronique](#signature-électronique-fast-parapheur).

## Étape 4 : préparer les données initiales

Au premier démarrage, OASIS remplit sa base à partir des fichiers de `backend/fixtures/deploiement`.
Ils contiennent le référentiel de l'université de Bordeaux : profils, campus, types d'aménagements,
administrateurs. Les adapter à Paris-Saclay avant le premier démarrage. Ce remplissage ne se fait que
sur une base vide.

**À compléter :** référentiel de Paris-Saclay, à produire avec les métiers. Les profils « Handicap
permanent » et « Incapacité temporaire » doivent porter une typologie de handicap.

Ne jamais lancer `hautelook:fixtures:load` sur une base en service : cette commande vide les tables
avant de les remplir.

## Étape 5 : construire et démarrer

```bash
cd installation
docker compose build --pull
docker compose up -d
docker compose ps
```

Au démarrage, le backend joue lui-même les migrations de la base et génère ses clés : rien n'est à
lancer à la main.

## Étape 6 : paramétrer OASIS

À faire avec un compte administrateur :

| Écran | Réglage |
| --- | --- |
| *Administration › Paramètres* | `LIEU_COURRIER`, `ADRESSE_POSTALE`, `PRESIDENT_QUALITE` et `PRESIDENT_NOM`, repris par le PAEH |
| *Administration › Profils* | l'option « Avis médical requis pour éditer le PAEH » sur « Handicap permanent » et « Incapacité temporaire » |
| *Administration › Aménagements* | les types d'aménagements à inclure dans le PAEH |
| *Administration › Référents* | le circuit de signature de chaque composante, après le premier import des inscriptions |

## Étape 7 : vérifier

1. Se connecter par le CAS.
2. Ouvrir la fiche d'un étudiant : ses inscriptions et le niveau de sa formation viennent d'Apogée.
3. Afficher l'aperçu de son PAEH : logo, identité de l'UPS, niveau, voies de recours.
4. Envoyer un PAEH de test, et vérifier qu'il apparaît dans les documents du bénéficiaire.
5. Recréer les conteneurs avec `docker compose up -d --force-recreate`, et vérifier que le document
   est toujours là.

## Mettre à jour OASIS

1. Sauvegarder la base :
   ```bash
   docker compose exec postgres pg_dump -U app app > oasis-avant-maj.sql
   ```
2. Récupérer la nouvelle version de Bordeaux, et y recopier la personnalisation de Paris-Saclay.
3. Changer `APP_VERSION` dans `.env`.
4. Reconstruire et redémarrer : `docker compose build --pull`, puis `docker compose up -d`.

## Niveau d'études

Le niveau (L1 à M2, BUT1, LP1, ING3…) est calculé par les requêtes Apogée de ce dossier. OASIS
l'enregistre sur la formation : il s'imprime sur le PAEH et alimente le bilan d'activité.

| Fichier | Rôle |
| --- | --- |
| `backend/personnalisation/config/apogee/apogee_get_inscriptions.sql` | inscriptions d'un étudiant, avec le niveau de sa formation |
| `backend/personnalisation/config/apogee/apogee_get_formation.sql` | diplôme, niveau et discipline d'une formation, sans la table de niveaux propre à Bordeaux |

La règle, par type de diplôme Apogée :

- santé (PASS, LAS, études médicales) : pas de niveau ;
- BUT, DEUST, licence professionnelle, ingénieur : un préfixe et l'année dans le diplôme, par
  exemple BUT2, LP1, ING3 à ING5 ;
- licence, master, CPES : L1 à M2, d'après le cycle et l'année dans le diplôme ;
- autres types (DU, échange…) : pas de niveau, sauf si le code étape commence par un niveau
  (L1INFO, M2ARTS…).

Les deux requêtes appliquent la même règle : une modification se fait dans les deux.

OASIS calcule le niveau d'une formation une seule fois, puis le complète seulement s'il est vide.
**Au premier déploiement**, et après toute modification de la règle, remettre les niveaux à vide :
ils sont recalculés au prochain import des inscriptions.

```sql
update formation set niveau = null;
```

## Données affichées sur la fiche

Redoublement, cursus aménagé, adresse postale et situation sociale : ces données seront lues dans
Apogée à la demande, sans être enregistrées, selon le mécanisme que prépare Bordeaux. La requête
des inscriptions les contient déjà ; OASIS ne les lit pas encore.

## Décision d'aménagements (PAEH)

Le document suit le modèle de Paris-Saclay : visas juridiques, destinataire, aménagements classés
en études, aides humaines et examens, observations, voies de recours.

| Fichier | Rôle |
| --- | --- |
| `backend/personnalisation/templates/Decisions/index.html.twig` | le document, qui remplace celui de l'application dans l'image |
| `backend/personnalisation/templates/Decisions/footer.html.twig` | le pied de page (adresse postale, pagination) |

Le gabarit ne lit que ce que l'application fournit déjà ; les classes de l'application ne sont pas
modifiées. Un type d'aménagement coché dans plusieurs catégories (études, aides humaines, examens)
apparaît dans chacune ; seuls les types à inclure dans la décision figurent sur le document.

Le logo est celui d'`APP_LOGO`, déposé à l'étape 1.
Le tribunal administratif compétent est écrit en tête du gabarit (`tribunalAdministratif`), avec
les autres réglages propres à Paris-Saclay.

**À compléter :** numéro d'avenant.

## Signature électronique (FAST-Parapheur)

Le PAEH est signé dans FAST au lieu d'être envoyé par e-mail. Quand le chargé d'accompagnement
demande l'édition, OASIS dépose le document dans le circuit FAST de la composante de l'étudiant.
FAST fait signer, puis envoie le PDF signé à l'étudiant. OASIS récupère le document signé et le
range au dossier du bénéficiaire. Une composante sans circuit garde l'envoi par e-mail.

Rien n'est à copier dans `personnalisation/` : le connecteur FAST fait partie de l'application. Le
gabarit de Paris-Saclay remplace déjà la mention « Signé numériquement le … » par « Signé
électroniquement » quand le document part dans FAST.

### Prérequis

- Une version d'OASIS qui intègre la **signature électronique** et le **connecteur FAST**.
- Le **certificat de dépôt** d'OASIS (fichier `.p12`) et son mot de passe, fournis par le chargé de
  projet FAST de l'UPS. Le mot de passe arrive par un autre canal que le certificat.
- Un **circuit FAST par composante**, avec l'envoi du document signé au destinataire activé. Sans
  cette activation, FAST refuse le dépôt.

### Certificat

Convertir le `.p12` en `client.pem`, comme l'indique le
[guide d'installation](../docs/installation/README.md#signature-électronique-facultatif), puis le
déposer dans `installation/secrets/parapheur/`. Ce dossier est exclu du dépôt. Décommenter son
montage dans `compose.yaml`, pour le **backend** et pour le **worker** : c'est le worker qui dépose et
suit les documents.

Noter la date d'expiration du certificat, et prévoir son renouvellement :

```bash
openssl x509 -in installation/secrets/parapheur/client.pem -noout -enddate
```

### Variables (`installation/.env`)

```dotenv
PARAPHEUR=fast
FAST_URL=https://parapheur.dfast.fr/parapheur-soap/soap/v1/Documents
FAST_SIREN=…
FAST_CERTIFICAT=/run/secrets/parapheur/client.pem
```

- `FAST_URL` : l'adresse de production. La préproduction utilise la plateforme de démonstration,
  `https://demo-parapheur.dfast.fr/parapheur-soap/soap/v1/Documents`.
- `FAST_SIREN` : le numéro d'abonné de l'UPS, fourni avec le certificat. La démonstration a son
  propre numéro.
- `FAST_CERTIFICAT_MOT_DE_PASSE` reste vide si la clé a été convertie en clair, comme dans le guide.
- `FAST_ETATS_FIN` : les états de l'historique FAST qui terminent un circuit. Vide, « Signé »,
  « Classé » ou « Archivé » le terminent. Si l'UPS active le classement ou l'archivage automatique en
  fin de circuit, n'attendre que cet état, par exemple `FAST_ETATS_FIN=Classé` : c'est le signal le
  plus sûr pour un circuit à plusieurs signatures.

### Mise en service, dans cet ordre

1. Démarrer OASIS et lancer l'**import des inscriptions** : c'est lui qui crée les composantes.
2. Vérifier la connexion à FAST et lister les circuits autorisés pour le certificat :

   ```bash
   docker compose exec backend php bin/console app:signature:fast:circuits
   ```

   Un circuit absent de la liste refusera le dépôt : le certificat n'y est pas autorisé.
3. Dans *Administration › Référents*, ouvrir chaque composante et renseigner son **Circuit de
   signature** avec l'identifiant affiché par la commande.
4. Dans *Administration › Paramètres*, régler `FREQUENCE_SUIVI_SIGNATURES`, la fréquence à laquelle
   OASIS interroge FAST (une heure par défaut, par exemple `15 minutes`), puis redémarrer le worker.
5. Faire un essai complet sur un étudiant de chaque composante.

### Correspondance des composantes et des circuits

À remplir avec la liste fournie par le chargé de projet FAST :

| Composante (libellé dans OASIS) | Identifiant du circuit FAST |
| --- | --- |
| … | … |

### Points d'attention

- Pour un étudiant **sans inscription en cours**, par exemple avant sa réinscription, OASIS ne
  connaît pas sa composante, donc pas son circuit. L'envoi de son PAEH est refusé, avec le motif
  affiché sur le bouton, jusqu'à l'import de sa nouvelle inscription.
- La fin du circuit est lue dans l'historique FAST. Sur un circuit à **plusieurs signatures**, le
  vérifier lors de l'essai : le PAEH ne doit passer à « signé » qu'après la dernière. Le classement
  automatique en fin de circuit, choisi comme seul état de fin, lève tout doute.

## Dépannage

| Symptôme | Cause probable | Action |
| --- | --- | --- |
| La construction du frontend échoue sur `favicon*.ico` | aucun favicon déposé | déposer `installation/frontend/personnalisation/favicon.ico` |
| Les téléversements sont refusés après le premier démarrage | l'antivirus charge encore sa base | attendre, ou `CLAMAV_STRICT_MODE=false` le temps du chargement |
| L'interface ou le PAEH affiche des valeurs d'exemple | identité non renseignée dans `.env` | compléter `.env`, puis `docker compose up -d` |
| Une modification de `.env` n'est pas prise en compte | conteneurs seulement redémarrés | `docker compose up -d`, qui les recrée |
| L'enregistrement d'un profil ou l'import tourne une minute puis échoue | base Apogée injoignable | vérifier l'accès réseau du serveur à Apogée |
| Un document téléversé disparaît après un redéploiement | stockage dans `/tmp` | monter le volume des documents, étape 3 |
| Le PAEH s'affiche sans logo | Gotenberg, qui fabrique le PDF, télécharge le logo à l'adresse `BACK_URL` et ne la joint pas depuis son conteneur (nom DNS non résolu, certificat refusé), ou le fichier d'`APP_LOGO` est absent | vérifier depuis le serveur : `docker compose exec gotenberg curl -sI <BACK_URL>/images/<logo>` doit répondre 200 |
| Aucun e-mail n'est envoyé | `MAILER_DSN` absente ou à `null://null` | renseigner le relais SMTP |
