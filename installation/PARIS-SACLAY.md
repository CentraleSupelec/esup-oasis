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
  serveur. Sans elle, l'import des inscriptions, qui s'exécute dans le worker, n'utilise ni les
  requêtes ni le calcul de Paris-Saclay. Cette correction est à proposer à Bordeaux.

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

À compléter : adresse du service, certificat, correspondance entre composantes et circuits de
signature.
