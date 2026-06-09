/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Badge } from "antd";
import React from "react";
import { useApi } from "@context/api/ApiProvider";

/**
 * Badge pour afficher le nombre de demandes d'un utilisateur
 * @param props
 * @constructor
 */
export default function DemandesBadge(props: { utilisateurId: string }) {
  const { data: demandes } = useApi().useGetFullCollection({
    path: "/demandes",
    query: {
      demandeur: props.utilisateurId,
      format_simple: true,
    },
  });

  return demandes && demandes.items.length > 0 ? (
    <Badge color="cyan" size="small" count={demandes.items.length} />
  ) : null;
}
