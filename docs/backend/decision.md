# Décision d'aménagements

La décision d'aménagements (PAEH) est un document PDF généré à la demande depuis la fiche
d'un bénéficiaire. Cette page décrit ce qui peut être adapté à l'établissement, et comment.

Rien n'est obligatoire : sans la variable ci-dessous, le comportement est inchangé.

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
