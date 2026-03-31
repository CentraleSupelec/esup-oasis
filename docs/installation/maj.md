# Mettre à jour

Le déploiement en version tout-en-un est basé sur des images docker pré-construites et mises à disposition sur github.
On utilise le numéro de version spécifié dans le fichier .env pour déterminer quelle image docker utiliser, et des
images locales sont créées en y appliquant simplement les personnalisations locales.

La mise à jour est donc simple : il suffit dans la plupart des cas de modifier la version dans le fichier .env et de
relancer la construction des images locales avec un :

```
docker compose build
```

Si des modifications supplémentaires (ajout/suppression de variables d'environnement par exemple) sont nécessaires,
elles feront l'objet d'information dans les notes de livraison de la version concernée.

> [!WARNING]
> Comme pour toute mise à jour, nous ne pouvons que vous recommander de faire une sauvegarde des données avant de
> procéder à la mise à jour.