# Installation d'OASIS à l'université Paris-Saclay

OASIS est un progiciel édité par l'université de Bordeaux. Paris-Saclay l'installe sans en
modifier le code : ce qui lui est propre (configuration, requêtes Apogée, calculs qui dépendent
de son paramétrage) est rassemblé dans le dossier `installation/`, et copié dans les images au
moment de leur construction.

Ce document indique, fonctionnalité par fonctionnalité, ce que ce dossier contient et ce qu'il
faut configurer.

## Prérequis

- Une version d'OASIS qui intègre le **calcul de scolarité interchangeable**
  (`AbstractCalculScolarite`, variable `SI_SCOL_CALCUL`). Cette évolution est proposée à Bordeaux
  et n'est pas encore intégrée.
- La correction de l'image du **worker**, qui doit recevoir la personnalisation comme l'image du
  serveur. Sans elle, l'import des inscriptions et l'envoi du PAEH, qui s'exécutent dans le worker,
  n'utilisent ni les requêtes ni le gabarit de Paris-Saclay. Cette correction est intégrée au code de
  Bordeaux : il faut une version publiée qui la contient.

## Profil étudiant

Niveau d'études, redoublement, cursus adapté, adresse postale et situation sociale, affichés sur
la fiche du bénéficiaire ; le niveau alimente aussi le bilan d'activité.

| Fichier | Rôle |
| --- | --- |
| `backend/personnalisation/config/apogee/apogee_get_inscriptions.sql` | inscriptions d'un étudiant, avec les colonnes utiles au calcul |
| `backend/personnalisation/config/apogee/apogee_get_formation.sql` | diplôme et discipline d'une formation, sans la table de niveaux propre à Bordeaux |
| `backend/personnalisation/SiScol/CalculScolariteSaclay.php` | calcul du niveau et du redoublement |
| `backend/personnalisation/SiScol/NiveauResolver.php`, `NiveauExtractor.php`, `RedoublementCalculator.php` | règles de Paris-Saclay (codes des types de diplôme, préfixes d'étape, compteur d'inscriptions) |
| `backend/personnalisation/tests/` | tests des règles ; ils ne sont pas copiés dans les images |

Variables d'environnement (`installation/.env`) :

```dotenv
SI_SCOL=APOGEE
SI_SCOL_CALCUL=apogee_saclay
APOGEE_USER=…
APOGEE_PWD=…
APOGEE_DB=…
```

Les variables `APOGEE_REQUETE_*` gardent leur valeur par défaut : les requêtes de ce dossier
remplacent celles de l'application dans l'image.

**Au premier déploiement**, remettre à vide les niveaux de formation enregistrés à blanc par les
versions précédentes ; l'application ne complète que les niveaux absents :

```sql
update formation set niveau = null where trim(niveau) = '';
```

**Vérifier les règles** avant de construire les images, depuis le conteneur de développement :

```bash
php -d date.timezone=UTC vendor/bin/phpunit --no-configuration \
    --bootstrap /chemin/vers/installation/backend/personnalisation/tests/bootstrap.php \
    /chemin/vers/installation/backend/personnalisation/tests/SiScol
```

## Décision d'aménagements (PAEH)

Le document suit le modèle de Paris-Saclay : visas juridiques, destinataire, aménagements classés en études, aides humaines et examens, observations, voies de recours.

| Fichier | Rôle |
| --- | --- |
| `backend/personnalisation/templates/Decisions/index.html.twig` | le document, qui remplace celui de l'application dans l'image |
| `backend/personnalisation/templates/Decisions/footer.html.twig` | le pied de page (adresse postale, pagination) |

Le gabarit ne lit que ce que l'application fournit déjà ; les classes de l'application ne sont pas modifiées. Un type d'aménagement coché dans plusieurs catégories (études, aides humaines, examens) apparaît dans chacune ; seuls les types marqués « à inclure dans la décision » figurent sur le document.

Identité de l'établissement (`installation/.env`) :

```dotenv
APP_ETABLISSEMENT="Université Paris-Saclay"
APP_ETABLISSEMENT_ARTICLE="l'Université Paris-Saclay"
APP_LOGO="/images/…"
```

Le logo se dépose dans `backend/personnalisation/public/images/`, sous le nom donné à `APP_LOGO`.

Dans *Administration › Paramètres* : le lieu du courrier, l'adresse postale du pied de page, la qualité et le nom du signataire.

Le tribunal administratif compétent est écrit en tête du gabarit (`tribunalAdministratif`), avec les autres réglages propres à Paris-Saclay.

À compléter : exigence de l'avis médical par profil, numéro d'avenant.

## Signature électronique (FAST-Parapheur)

Le PAEH est signé dans FAST au lieu d'être envoyé par e-mail. Quand le chargé d'accompagnement
demande l'édition, OASIS dépose le document dans le circuit FAST de la composante de l'étudiant.
FAST fait signer, puis envoie le PDF signé à l'étudiant. OASIS récupère le document signé et le
range au dossier du bénéficiaire. Une composante sans circuit garde l'envoi par e-mail.

Rien n'est à copier dans `personnalisation/` : le connecteur FAST fait partie de l'application. Le
gabarit de Paris-Saclay remplace déjà la mention « Signé numériquement le … » par « Signé
électroniquement » quand le document part dans FAST.

### Prérequis

- Une version d'OASIS qui intègre la **signature électronique** et le **connecteur FAST**. Ces
  évolutions sont proposées à Bordeaux et ne sont pas encore intégrées.
- Le **certificat de dépôt** d'OASIS (fichier `.p12`) et son mot de passe, fournis par le chargé de
  projet FAST de l'UPS. Le mot de passe arrive par un autre canal que le certificat.
- Un **circuit FAST par composante**, créé par le support FAST, avec l'envoi du document signé au
  destinataire activé. Sans cette activation, FAST refuse le dépôt.
- Un accès réseau sortant du serveur OASIS vers FAST, en HTTPS.

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

- Un étudiant **sans inscription en cours**, par exemple avant sa réinscription, ou **inscrit dans
  deux composantes** aux circuits différents, reçoit son PAEH par e-mail, sans signature. Une
  correction est en cours.
- La fin du circuit est lue dans l'historique FAST. Sur un circuit à **plusieurs signatures**, le
  vérifier lors de l'essai : le PAEH ne doit passer à « signé » qu'après la dernière.
