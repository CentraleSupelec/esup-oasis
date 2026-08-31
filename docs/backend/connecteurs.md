# Connecteurs

Oasis s'intègre dans le SI de l'établissement en s'appuyant sur plusieurs briques existantes. Cette section décrit
ces connexions et comment il est possible de les configurer / adapter.

## Serveur OAuth

L'application utilise une authentification OAuth, testée avec un serveur CAS v5.  
Le seul champ utilisé est l'id de l'utilisateur, qui doit correspondre au champ `uid` coté LDAP.

## Annuaire LDAP

L'annuaire LDAP est utilisé dans plusieurs contextes :

* lors de l'authentification d'un utilisateur non déjà connu, récupération des champs `uid`,  `sn`, `givenname`, `mail`
  et du champ pointé par la variable d'environnement LDAP_CHAMP_ETU_ID (`supannetuid` par défaut).
* lors de la recherche d'un utilisateur en vue de lui attribuer un rôle, recherche textuelle sur les champs
  `uid` et `cn` (par défaut, cf plus bas) pour récupération des mêmes champs que précédemment.

La liste des champs de recherche est adaptable via la variable d'environnement `LDAP_CHAMPS_RECHERCHE`, et vous pouvez
également personnaliser la recherche en ajoutant des critères via la variable `LDAP_CRITERES_RECHERCHE_SUP`.  
Par exemple pour les valeurs suivantes :

```
LDAP_CHAMPS_RECHERCHE='["uid", "cn"]'
LDAP_CRITERES_RECHERCHE_SUP="(eduPersonAffiliation=member)(|(ubxstatutcompte=ACTIF)(ubxstatutcompte=NOUVEAU))"
```

la recherche de la chaine de caractères "toto" se fera avec la requête
`(&(eduPersonAffiliation=member)(|(ubxstatutcompte=ACTIF)(ubxstatutcompte=NOUVEAU))(|(uid=*toto*)(cn=*toto*)))`

## SI scolarité

Oasis récupère des informations relatives à l'identité et aux inscriptions des étudiants dans le SI Scolarité. À ce
jour un connecteur Apogée via connexion à la base Oracle est disponible.

### Données récupérées

Oasis récupère actuellement dans Apogée :

* les inscriptions :
    * composantes de formation (table `composante`)
    * étape, version d'étape, libellé web de version d'étape, discipline,
      libellé de diplôme, niveau LMD (**basé sur une table locale !** ) (table `formation`)
    * inscription d'un étudiant à une formation pour une période donnée (table `inscription` - les début et fin de
      période sont figées au 01/09 et 31/08 de l'année universitaire)
    * statut boursier (déprécié, plus montré dans l'interface)
    * régime d'inscription
* des données personnelles complémentaires non présentes dans l'annuaire :
    * numéro de téléphone perso
    * date de naissance
    * civilité d'usage

Ces données sont récupérées à la création initiale de l'utilisateur dans l'application, puis rafraichies par un
traitement hebdomadaire.  
Un rafraichissement est également déclenché à la connexion si l'utilisateur qui se connecte est un étudiant déjà connu
pour lequel on n'a pas d'inscription en cours en base.

### Personnalisation

Plusieurs possibilités:

* personnaliser la requête Apogée
* écrire sa propre classe de récupération des données

#### Personnaliser la requête

Deux requêtes sont utilisées et adaptables pour vos besoins en modifiant simplement les fichiers sql disponibles dans
le dossier `config/apogee` (attention à bien respecter les noms des champs retournés !) :

* `apogee_get_formation.sql` : récupère le diplôme, la discipline, et le niveau LMD d'une version d'étape
* `apogee_get_inscriptions.sql` : récupère pour un étudiant la liste de ses inscriptions et données personnelles
  complémentaires entre deux dates
    * année
    * version d'étape
    * composante
    * diplôme
    * discipline
    * composante
    * date de naissance
    * civilité d'usage
    * numéro de téléphone perso
    * témoin "boursier"
    * régime d'inscription

Les versions livrées de ces requêtes s'appuient sur une table locale `extern_niveau_etape` pour remonter le niveau LMD,
vous devrez donc les adapter. Le niveau LMD peut être simplement laissé vide.

De la même façon, la jointure `typ_diplome` (qui alimente les alias `COD_TPD_ETB` et `TEM_SANTE`, servant à dériver le
niveau par famille de diplôme) est **facultative** : si votre instance ne dispose pas de cette table, retirez-la de
`apogee_get_inscriptions.sql`. Ces deux alias valent alors `null` et le niveau retombe sur le LMD nominal dérivé de
`CYCLE` + `ANNEE_DIPLOME`.

##### Colonnes (alias) attendues par le code

Le code PHP ne connaît pas les noms de colonnes réels d'Apogée : il lit les **alias** renvoyés par les requêtes (oci8 les
remonte en MAJUSCULES). Adapter le connecteur à un autre établissement revient donc à **modifier uniquement les deux
fichiers SQL** pour que chaque colonne réelle soit renvoyée sous l'alias attendu ci-dessous ; le reste du code n'est pas
à toucher.

`apogee_get_inscriptions.sql`, paramètres liés : `:codEtu`, `:debut`, `:fin`.

Alias obligatoires (le SQL doit les renvoyer) :

| Alias | Alimente | Remarque |
| --- | --- | --- |
| `COD_ETP` | code étape (cursus et dérivation du niveau) | |
| `COD_VRS_VET` | version d'étape | |
| `LIB_WEB_VET` | libellé de la formation | |
| `COD_CMP`, `LIB_CMP` | composante | |
| `COD_ANU` | année universitaire (début/fin figés au 01/09 et 31/08) | |
| `TEM_BRS_IAA` | témoin boursier (`O`/`N`) | déprécié, conservé pour compatibilité |
| `LIB_RGI` | régime d'inscription (rangé dans le champ `statut`) | |
| `NIVEAU` | niveau LMD affiché | Bordeaux : table locale `extern_niveau_etape` ; peut être renvoyé vide |
| `LIB_DSI` | discipline | |
| `LIB_DIP` | diplôme | |

Alias optionnels (absents, valent `null`, sans erreur) :

| Alias | Alimente | Remarque |
| --- | --- | --- |
| `NUM_TEL` | téléphone perso | |
| `DATE_NAI_IND` | date de naissance | |
| `COD_SEX_ETU` | civilité d'usage | |
| `COD_SOC`, `LIB_SOC` | situation sociale (boursier `NO`/`BO`, etc.) | codes SISE |
| `ADR_LIB_AD1`, `ADR_LIB_AD2`, `ADR_LIB_AD3`, `ADR_COD_BDI`, `ADR_LIB_VIL`, `ADR_COD_PAY` | adresse postale (annuelle, repli fixe) | |
| `NBR_INS_ETP` | nombre d'inscriptions à l'étape (base du redoublement) | compteur natif |
| `COD_SIS_CUR_AMG`, `LIB_CUR_AMG` | cursus aménagé | code SISE |
| `CYCLE` | cycle du diplôme (1 = Licence, 2 = Master, 3 = Doctorat) | avec `ANNEE_DIPLOME`, dérive le niveau LMD (données SISE nationales, donc portables) |
| `ANNEE_DIPLOME` | année dans le diplôme (`cod_sis_daa`) | idem |
| `COD_TPD_ETB` | type de diplôme (famille : LMD, BUT, CPES, licence pro, ingénieur…) | code établissement ; dérive le niveau par famille. Absent → niveau vide, jamais faux |
| `TEM_SANTE` | indicateur santé (`O` = PASS/LAS/formation de santé) | écarte le niveau des cursus santé. Absent → cursus non traité comme santé |

`apogee_get_formation.sql`, paramètres liés : `:codEtp`, `:codVrsVet`. Renvoie `LIB_DIP` (diplôme), `NIVEAU` (niveau
LMD, peut être vide), `LIB_DSI` (discipline).

#### Implémentation sa propre classe

Vous pouvez aussi opter pour une réimplémentation locale de l'interfaçage avec le SI scolarité (pour utiliser les WS
apogée, pour un établissement utilisant Pegase...) en étendant la classe abstraite
[`App\Service\SiScol\AbstractSiScolDataProvider`](../../backend/src/Service/SiScol/AbstractSiScolDataProvider.php).

Les méthodes à implémenter sont le miroir des deux requêtes plus haut : `getInscriptions` doit retourner un tableau des
inscriptions, `getFormation` retourne un tableau contenant les informations de cette formation. Attention à respecter le
format de tableau en prenant exemple sur l'implémentation fournie.

## GED Nuxeo

Voir [la section dédiée aux pièces justificatives](pieces_justificatives.md)

## Photos

Oasis peut récupérer et afficher les photos des étudiants (aux utilisateurs ayant un rôle gestionnaire ou
supérieur).  
Cette fonctionnalité est totalement optionnelle, si vous laissez la configuration par défaut l'application affichera des
silhouettes à la place des photos.

La récupération des photos est réalisée à l'Université de Bordeaux en interrogeant directement la base de données Oracle
de l'application Uni'Campus de Monécarte, mais cette solution est spécifique à nos usages et peut difficilement être
généralisée.

Il est donc prévu de pouvoir implémenter la récupération des photos avec la méthode de votre choix, simplement en
implémentant l'interface `App\Service\Photo\PhotoProviderInterface` et en référençant votre propre implémentation comme
celle par défaut de l'interface dans la configuration de symfony : dans le fichier `config/services.yaml` ajoutez dans
les bindings par défaut un binding de l'interface vers votre implémentation locale :

<pre>
services:
  _defaults:
    autowire: true      # Automatically injects dependencies in your services.
    autoconfigure: true # Automatically registers your services as commands, event subscribers, etc.
    bind:
      App\Service\FileStorage\StorageProviderInterface $storageProvider: '@App\Service\FileStorage\NuxeoStorageProvider'
      <b>App\Service\Photo\PhotoProviderInterface $photoProvider: '@App\Service\Photo\MonImplementationLocale'</b>
      $startScheduleNow: '%env(resolve:APP_SCHEDULER_START_NOW)%'
</pre>

Cette interface ne contient qu'une méthode, retournant pour l'utilisateur passé en paramètre le contenu d'une image
JPEG.