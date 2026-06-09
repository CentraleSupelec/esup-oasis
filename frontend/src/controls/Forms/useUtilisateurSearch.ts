/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useState } from "react";
import { RoleValues } from "@lib";
import { useApi } from "@context/api/ApiProvider";

export interface IUseUtilisateurSearchProps {
  utilisateurId?: string;
  roleUtilisateur?: RoleValues;
  intervenantArchive?: boolean;
  existeNumeroEtudiant?: boolean;
  forcerRechercheGlobale?: boolean;
}

function getPath(forcerRechercheGlobale = false, roleUtilisateur?: string) {
  if (forcerRechercheGlobale) {
    return "/utilisateurs";
  }

  switch (roleUtilisateur) {
    case RoleValues.ROLE_INTERVENANT:
      return "/intervenants";
    case RoleValues.ROLE_BENEFICIAIRE:
      return "/beneficiaires";
    case RoleValues.ROLE_RENFORT:
      return "/renforts";
    case RoleValues.ROLE_ENSEIGNANT:
    default:
      return "/utilisateurs";
  }
}

function getFiltre(
  forcerRechercheGlobale = false,
  roleUtilisateur?: string,
  recherche?: string,
  intervenantArchive?: boolean,
  existeNumeroEtudiant?: boolean,
) {
  if (forcerRechercheGlobale) {
    return {
      // recherche en base
      recherche: recherche,
      intervenantArchive,
      "exists[numeroEtudiant]": existeNumeroEtudiant,
    };
  }

  if (getPath(forcerRechercheGlobale, roleUtilisateur) === "/utilisateurs") {
    return {
      // recherche LDAP
      term: recherche,
      intervenantArchive,
      "exists[numeroEtudiant]": existeNumeroEtudiant,
    };
  } else {
    return {
      // recherche en base
      recherche: recherche,
      intervenantArchive,
      "exists[numeroEtudiant]": existeNumeroEtudiant,
    };
  }
}

export const useUtilisateurSearch = ({
  utilisateurId,
  roleUtilisateur,
  intervenantArchive,
  existeNumeroEtudiant,
  forcerRechercheGlobale,
}: IUseUtilisateurSearchProps) => {
  const [tappedSearch, setTappedSearch] = useState("");
  const [search, setSearch] = useState("");
  const itemsPerPage = 25;

  const { data: dataUtilisateur, isFetching: isFetchingUtilisateur } = useApi().useGetItem({
    path: "/utilisateurs/{uid}",
    url: utilisateurId as string,
    enabled: !!utilisateurId,
  });

  const { data: utilisateursTrouves, isFetching: isFetchingUtilisateursTrouves } =
    useApi().useGetFullCollection({
      path: getPath(forcerRechercheGlobale, roleUtilisateur),
      enabled: search.length > 1,
      query: getFiltre(
        forcerRechercheGlobale,
        roleUtilisateur,
        search,
        intervenantArchive,
        existeNumeroEtudiant,
      ),
    });

  return {
    tappedSearch,
    setTappedSearch,
    search,
    setSearch,
    itemsPerPage,
    dataUtilisateur,
    isFetchingUtilisateur,
    utilisateursTrouves,
    isFetchingUtilisateursTrouves,
  };
};
