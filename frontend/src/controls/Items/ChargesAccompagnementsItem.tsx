/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { IUtilisateur } from "@api";
import React from "react";
import { useApi } from "@context/api/ApiProvider";
import { GestionnaireItem } from "./GestionnaireItem";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "antd";

export function ChargesAccompagnementsItem(props: {
  utilisateurId?: string | undefined;
  utilisateur?: IUtilisateur;
}) {
  const { ref, inView } = useInView();

  const { data } = useApi().useGetItem({
    path: "/utilisateurs/{uid}",
    url: props.utilisateurId,
    enabled: !!props.utilisateurId && inView,
  });

  const item = data ?? props.utilisateur;

  if (!item)
    return (
      <div ref={ref}>
        <Skeleton.Input className="mb-05" active />
      </div>
    );

  return item.gestionnairesActifs?.map((g: string) => (
    <div key={g} style={{ margin: "2px 0" }}>
      <GestionnaireItem gestionnaireId={g} initialePrenom />
    </div>
  ));
}
