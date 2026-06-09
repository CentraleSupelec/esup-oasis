/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Tag } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import { IEvenement, PREFETCH_TYPES_EVENEMENTS } from "@api";

interface IItemEtatValidationProps {
  evenement: IEvenement;
}

/**
 * Renders the validation state of an event item.
 *
 * @param {IItemEtatValidationProps} props - The input properties.
 * @param {IEvenement} props.evenement - The event object.
 *
 * @return {ReactElement | null} - The validation status component, or null if validation is not required.
 */
export function EvenementEtatValidationItem({
  evenement,
}: IItemEtatValidationProps): ReactElement | null {
  const { data: typesEvenements } = useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);

  if (typesEvenements?.items.find((t) => t["@id"] === evenement.type)?.avecValidation === false)
    return null;

  if (evenement.dateValidation)
    return (
      <Tag color="green" icon={<CheckOutlined />}>
        Validé par chargé d'accomp.
      </Tag>
    );

  return (
    <Tag color="warning" icon={<CloseOutlined />}>
      Non validé par chargé d'accomp.
    </Tag>
  );
}
