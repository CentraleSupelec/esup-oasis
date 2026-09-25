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

#### Implémentation de sa propre classe

Vous pouvez aussi opter pour une réimplémentation locale de l'interfaçage avec le SI scolarité (pour utiliser les WS
apogée, pour un établissement utilisant Pegase...) en étendant la classe abstraite
[`App\Service\SiScol\AbstractSiScolDataProvider`](../../backend/src/Service/SiScol/AbstractSiScolDataProvider.php).

Les méthodes à implémenter sont le miroir des deux requêtes plus haut : `getInscriptions` doit retourner un tableau des
inscriptions, `getFormation` retourne un tableau contenant les informations de cette formation. Attention à respecter le
format de tableau en prenant exemple sur l'implémentation fournie.

Une 3ème méthode getProviderId () doit retourner une chaine de caractères (de votre choix, mais unique parmi les
implémentations disponibles) servant d'identifiant pour cette iméplmentation; il faudra ensuite utiliser cette valeur
pour renseigner la variable d'environnement `SI_SCOL`, dont la valeur par défaut est `APOGEE`.

## GED Nuxeo

Voir [la section dédiée aux pièces justificatives](pieces_justificatives.md)

## Signature électronique FAST-Parapheur

Oasis peut faire signer électroniquement la décision d'aménagements d'examens via
[FAST-Parapheur](https://www.docaposte.com/solutions/fast-parapheur) (Docaposte) : au lieu d'être envoyé
par e-mail, le PDF est déposé dans un circuit de signature configuré côté FAST (les signataires, l'ordre
des étapes et les relances sont portés par FAST), puis récupéré signé une fois le circuit terminé.

Cette fonctionnalité est **totalement optionnelle** : si vous laissez la configuration par défaut,
l'application conserve le comportement historique (génération du PDF et envoi par e-mail). L'activation
se fait uniquement par configuration, et la désactivation restaure le comportement historique sans autre
intervention.

### Activation

L'unique interrupteur est la variable `FAST_CIRCUITS`, qui associe un code composante (celui stocké dans
`composante.code_externe`, `COD_CMP` pour Apogée) à l'identifiant d'un circuit FAST, au format JSON :

```dotenv
FAST_CIRCUITS='{"CODE_COMPOSANTE_1": "identifiant-circuit-1", "CODE_COMPOSANTE_2": "identifiant-circuit-2"}'
```

* variable vide ou absente : connecteur inactif, comportement historique pour toutes les décisions ;
* composante absente du mapping : comportement historique pour ses bénéficiaires, ce qui permet une
  activation progressive, composante par composante.

Quand un étudiant a des inscriptions en cours dans plusieurs composantes reliées à des circuits différents,
le connecteur ne choisit pas de signataire à la place de l'établissement : la décision suit le comportement
historique. Les requêtes Apogée livrées ne remontent que l'inscription principale (`tem_iae_prm = 'O'`), ce
qui écarte ce cas pour les doubles cursus d'une même année.

### Suivi des signatures

Une fois déposée, la décision passe à l'état de signature `EN_SIGNATURE`. Le worker interroge ensuite FAST
à intervalle régulier sur les décisions en cours, récupère les documents signés, les dépose au dossier du
bénéficiaire et fait évoluer leur état (`SIGNEE`, `REFUSEE`, `EXPIREE`, `ERREUR`). Les issues négatives sont
enregistrées et visibles sur la fiche du bénéficiaire.

La fréquence d'interrogation se règle par la variable `FAST_FREQUENCE_SUIVI`, au format du Scheduler Symfony
(`15 minutes`, `2 hours`…), une heure par défaut. Aucune interrogation n'est planifiée tant qu'aucun client
FAST n'est configuré. La commande `app:fast:suivi-signatures` effectue le même traitement à la demande, par
exemple pour un contrôle ponctuel.

Si aucune décision du lot n'a pu être vérifiée, un message de niveau `critical` signale que FAST semble
injoignable ; les décisions concernées sont reprises au passage suivant.

### Date de signature et gabarit du document

Le document est déposé dans FAST avant d'être signé : il ne peut donc pas imprimer la date de sa propre
signature. Cette date, celle du dernier signataire du circuit, est lue dans l'historique FAST au moment où le
document signé est récupéré, puis enregistrée sur la décision et affichée sur la fiche du bénéficiaire.

Le gabarit de la décision reçoit la variable `data.signature_electronique`, vraie quand le document part en
signature électronique. Un établissement peut s'en servir pour adapter son modèle, par exemple ne pas y
insérer l'image de signature scannée ou une mention « signé le » :

```twig
{% if not data.signature_electronique %}
    {# signature scannée, mention de date… #}
{% endif %}
```

### Personnalisation

Le connecteur s'appuie sur l'interface `App\Service\Signature\FastParapheurClientInterface` : savoir si le
client est disponible, déposer un document dans un circuit, consulter son historique, télécharger le document
signé.

Deux implémentations sont livrées :

* `FastParapheurClientNonConfigure`, branchée par défaut : elle se déclare indisponible. Tant qu'aucun client
  réel n'est branché, les décisions suivent donc le comportement historique, **même si `FAST_CIRCUITS` est
  renseignée** ; un avertissement est alors journalisé. Une configuration incomplète ne peut pas faire
  disparaître une décision ;
* `FastParapheurClientFactice`, un client en mémoire branché en développement et en test, qui permet
  d'exercer le connecteur sans accès à FAST.

Pour activer la signature, fournissez une implémentation réelle de l'interface et déclarez-la comme alias
de `App\Service\Signature\FastParapheurClientInterface` dans `config/services.yaml`, puis renseignez
`FAST_CIRCUITS`. Le même principe permet de brancher un autre outil de signature.

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