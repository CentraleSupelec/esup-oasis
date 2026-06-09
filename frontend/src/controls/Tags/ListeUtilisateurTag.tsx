/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import React from "react";
import { UtilisateurTag } from "@controls/Tags/UtilisateurTag";
import Spinner from "@controls/Spinner/Spinner";

export function ListeUtilisateurTag(props: { utilisateurId: string }) {
  const { data: utilisateur, isFetching } = useApi().useGetItem({
    path: "/utilisateurs/{uid}",
    url: props.utilisateurId,
    parameters: {
      uid: props.utilisateurId,
    },
  });

  if (isFetching) return <Spinner />;
  if (!utilisateur) return null;

  return utilisateur.tags?.map((tag) => (
    <UtilisateurTag key={tag} tagId={tag} className="mr-05" utilisateurId={props.utilisateurId} />
  ));
}
