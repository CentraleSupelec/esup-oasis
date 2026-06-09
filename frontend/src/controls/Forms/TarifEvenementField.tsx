/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Button, Input, Skeleton, Space } from "antd";
import dayjs from "dayjs";
import { useApi } from "@context/api/ApiProvider";
import { IEvenement, PREFETCH_TYPES_EVENEMENTS } from "@api";
import { montantToString } from "@utils/number";

interface ITarifEvenementFieldProps {
  as?: "input" | "text";
  evenement: IEvenement;
}

export default function TarifEvenementField({
  evenement,
  as = "input",
}: ITarifEvenementFieldProps) {
  const { data: typesEvenements, isFetching: isFetchingTypeEvenement } =
    useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);
  const dureeTotale =
    dayjs(evenement.fin).diff(dayjs(evenement.debut), "minute") +
    Number(evenement.tempsPreparation || 0) +
    Number(evenement.tempsSupplementaire || 0);

  const { data: taux } = useApi().useGetCollection({
    path: "/types_evenements/{typeId}/taux",
    parameters: {
      typeId: evenement.type as string,
    },
    query: {
      date: dayjs(evenement.debut).format("YYYY-MM-DD"),
    },
    enabled:
      !!typesEvenements &&
      !!evenement.type &&
      !!typesEvenements?.items.find((t) => t["@id"] === evenement.type)?.tauxActif,
  });

  if (isFetchingTypeEvenement) {
    return <Skeleton active />;
  }

  if (!taux || taux.items.length !== 1 || !taux.items[0].montant) {
    return (
      <p className="text-warning">
        Pas de taux horaire défini actuellement pour les évènements de la catégorie "
        {typesEvenements?.items.find((t) => t["@id"] === evenement.type)?.libelle}"
      </p>
    );
  }

  if (as === "input") {
    return (
      <>
        <Space.Compact className="w-100">
          <Input
            disabled
            placeholder="0,00"
            className="text-center text-primary semi-bold"
            value={montantToString((dureeTotale / 60).toString(), taux.items[0].montant)}
          />
          <Button disabled className="bg-light text-dark border-left-0 px-3">
            €
          </Button>
        </Space.Compact>
        <div className="legende">
          Tarif horaire des évènements de la catégorie "
          {typesEvenements?.items.find((t) => t["@id"] === evenement.type)?.libelle}
          "&nbsp;:{" "}
          <span className="no-wrap">
            {taux.items[0].montant || "?"}
            &nbsp;€ brut / heure
          </span>
        </div>
      </>
    );
  }

  return (
    <Space>
      <span>{montantToString((dureeTotale / 60).toString(), taux.items[0].montant)}</span>
      <span>€</span>
    </Space>
  );
}
