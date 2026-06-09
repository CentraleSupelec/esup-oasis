/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";

/**
 * Returns the string representation of a user.
 *
 * @param {Object} props - The properties.
 * @param {string} props.utilisateurId - The user ID.
 * @return {string} - The string representation of the user.
 */
export function UtilisateurAsString(props: { utilisateurId?: string }): string {
  const { data: utilisateur } = useApi().useGetItem({
    path: "/utilisateurs/{uid}",
    url: props.utilisateurId as string,
    enabled: !!props.utilisateurId,
  });
  if (utilisateur) {
    return `${utilisateur.nom?.toLocaleUpperCase()} ${utilisateur.prenom}`;
  }
  return "Chargement en cours...";
}
