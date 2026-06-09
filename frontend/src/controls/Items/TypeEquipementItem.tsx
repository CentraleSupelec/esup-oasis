/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import Spinner from "@controls/Spinner/Spinner";
import { useApi } from "@context/api/ApiProvider";
import { ITypeEquipement, PREFETCH_TYPES_EQUIPEMENTS } from "@api";

interface IItemTypeEquipement {
  typeEquipement?: ITypeEquipement;
  typeEquipementId?: string;
}

/**
 * Renders the TypeEquipementItem component.
 *
 * @param {Object} props - The input object.
 * @param {ITypeEquipement} [props.typeEquipement] - The type of equipment.
 * @param {string} [props.typeEquipementId] - The ID of the type of equipment.
 *
 * @returns {ReactElement} The rendered TypeEquipementItem component.
 */
function TypeEquipementItem({
  typeEquipement,
  typeEquipementId,
}: IItemTypeEquipement): ReactElement {
  const { data: typeEquipementData } = useApi().useGetFullCollection(PREFETCH_TYPES_EQUIPEMENTS);
  const item =
    typeEquipement ?? typeEquipementData?.items.find((x) => x["@id"] === typeEquipementId);

  if (!item) return <Spinner />;

  return (
    <div>
      <span>{item?.libelle}</span>
    </div>
  );
}

const TypeEquipementItemMemo = memo(
  TypeEquipementItem,
  (prev, next) =>
    prev.typeEquipementId === next.typeEquipementId &&
    prev.typeEquipement?.["@id"] === next.typeEquipement?.["@id"],
);
export { TypeEquipementItemMemo as TypeEquipementItem };
