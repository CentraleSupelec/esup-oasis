/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "@context/api/ApiProvider";
import { PARAMETRE_COEF_COUT_CHARGE } from "@/constants";
import Spinner from "@controls/Spinner/Spinner";
import { Space } from "antd";
import { montantToString } from "@utils/number";
import React from "react";
import { IActivite } from "@routes/administration/Bilans/BeneficiairesIntervenants/components/BilanTable";

export function CoutCharge(props: { activite: IActivite }) {
  const { data: coef, isFetching: isFetchingCoef } = useApi().useGetItem({
    path: "/parametres/{cle}",
    url: PARAMETRE_COEF_COUT_CHARGE,
  });

  if (isFetchingCoef) return <Spinner />;

  if (!coef) return null;

  return (
    <Space className="cout-charge">
      {montantToString(
        props.activite.nbHeures,
        props.activite.tauxHoraire?.montant,
        coef?.valeursCourantes?.[0]?.valeur ?? undefined,
      )}
      <span>€</span>
    </Space>
  );
}
