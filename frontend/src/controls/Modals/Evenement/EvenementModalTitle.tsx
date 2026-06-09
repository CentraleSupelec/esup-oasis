/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Evenement } from "@lib";
import { EvenementEtatItem } from "@controls/Items/EvenementEtatItem";
import { ITypeEvenement } from "@api";

interface IEvenementModalTitleProps {
  evenement: Evenement;
  isFetchingType: boolean;
  typesEvenements: { items: ITypeEvenement[] } | undefined;
}

export default function EvenementModalTitle({
  evenement,
  isFetchingType,
  typesEvenements,
}: IEvenementModalTitleProps): ReactElement {
  if (isFetchingType) {
    return <>Détails de l'évènement</>;
  }

  const eventType = typesEvenements?.items.find((t) => t["@id"] === evenement.type);

  return (
    <>
      {evenement?.libelle || eventType?.libelle || "Nouvel évènement"}
      <div className="float-right">
        <EvenementEtatItem evenement={evenement} type={eventType} style={{ marginRight: 32 }} />
      </div>
    </>
  );
}
