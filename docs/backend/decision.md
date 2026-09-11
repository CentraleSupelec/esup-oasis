# Décision d'aménagements

La décision d'aménagements (PAEH) est un document PDF généré à la demande depuis la fiche
d'un bénéficiaire. Le gabarit livré convient tel quel ; cette page décrit ce qui peut être
adapté à l'établissement, et comment.

Rien n'est obligatoire : sans aucune des variables ci-dessous, le document est rendu
exactement comme auparavant.

## Identité de l'établissement

Le nom de l'établissement, celui du service et la ville étaient écrits dans le gabarit. Ils
proviennent désormais de la configuration, avec les mêmes valeurs par défaut.

| Variable | Alimente | Valeur par défaut |
| --- | --- | --- |
| `ETABLISSEMENT_NOM` | en-tête de l'expéditeur | `Université de Bordeaux` |
| `SERVICE_NOM` | service accompagnant, cité aussi dans le corps | `Service PHASE` |
| `ETABLISSEMENT_VILLE` | mention « Fait à … » | `Talence` |
| `ETABLISSEMENT_ADRESSE_RUE` | — | `351 cours de la libération` |
| `ETABLISSEMENT_ADRESSE_POSTALE` | — | `33405 Talence cedex` |
| `TRIBUNAL_ADMINISTRATIF_VILLE` | — | `Bordeaux` |
| `TRIBUNAL_ADMINISTRATIF_ADRESSE` | — | `9 rue Tastet, 33000 Bordeaux` |
| `AFFICHER_SERVICE_REFERENT` | — | `false` |

Les quatre dernières ne sont pas utilisées par le gabarit livré : elles sont à disposition
d'un gabarit personnalisé (voir plus bas), afin de ne pas avoir à y coder l'adresse ou le
tribunal compétent.

## Logo et bandeau

| Variable | Alimente | Valeur par défaut |
| --- | --- | --- |
| `LOGO_DECISION_FILENAME` | logo en en-tête | `logo_ub.svg` |
| `TRIANGLE_DECISION_FILENAME` | bandeau de pied de page | `triangle-ub.svg` |

Les fichiers sont cherchés dans `public/images`, où ils peuvent être déposés par la
personnalisation (`installation/backend/personnalisation/public/images`). Si le fichier
demandé est absent, celui livré est utilisé : une configuration incomplète n'empêche pas la
génération du document.

Les deux images sont incorporées au PDF plutôt que chargées par URL, ce qui évite au moteur
de rendu d'avoir à atteindre le serveur.

## Date de l'avis du médecin

La décision peut porter la date de l'avis du médecin, saisie depuis la fiche du bénéficiaire
en même temps que les observations.

Les établissements dont le visa cite cet avis ont besoin que la date soit renseignée avant
l'édition, faute de quoi la mention légale s'imprime à trous sur une pièce qui fait courir un
délai de recours. Dans ce cas :

```dotenv
PAEH_DATE_AVIS_MEDECIN_REQUISE=true
```

La demande d'édition est alors refusée tant que la date manque, et l'interface l'annonce avant
de laisser confirmer. Seule la demande d'édition est concernée : saisir des observations ou la
date elle-même reste possible, y compris sur une décision ancienne.

Sans cette variable, aucune contrainte ne s'applique et l'édition reste possible sans date.

## Utiliser son propre gabarit

Les variables ci-dessus couvrent l'identité de l'établissement. Un établissement dont le
document diffère dans sa structure — visas propres, sections supplémentaires, autre mise en
page — dépose son gabarit dans la personnalisation plutôt que de modifier celui livré :

```
installation/backend/personnalisation/templates/Decisions/index.html.twig
installation/backend/personnalisation/templates/Decisions/footer.html.twig
```

Ces fichiers écrasent ceux de l'image au moment du build (cf. `installation/backend/Dockerfile`),
comme pour les gabarits d'emails et de services faits. Les variables ci-dessus y sont
disponibles, ainsi que `data.logo_base64` et `data.triangle_base64` pour les images.

Un gabarit personnalisé n'a pas à être maintenu à l'identique de celui livré : il reste
autonome, et les évolutions du gabarit de référence ne s'y appliquent pas automatiquement.
