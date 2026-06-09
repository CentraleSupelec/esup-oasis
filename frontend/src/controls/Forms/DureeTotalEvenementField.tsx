/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Button, Input, Space } from "antd";
import dayjs from "dayjs";
import { IEvenement } from "@api";

interface IDureeTotaleEvenementFieldProps {
  evenement: IEvenement;
}

export function DureeTotaleEvenementField({ evenement }: IDureeTotaleEvenementFieldProps) {
  // get nb minutes between evenement.debut and evenement.fin
  const nbMinutes = dayjs(evenement.fin).diff(dayjs(evenement.debut), "minute");
  const dureeTotale =
    nbMinutes +
    Number(evenement.tempsPreparation || 0) +
    Number(evenement.tempsSupplementaire || 0);

  return (
    <>
      <Space.Compact className="w-100">
        <Input className="text-center text-primary semi-bold" disabled value={dureeTotale} />
        <Button disabled className="bg-light text-dark border-left-0">
          {dureeTotale > 1 ? "minutes" : "minute"}
        </Button>
      </Space.Compact>
      <br />
      <div className="legende">= {(dureeTotale / 60).toFixed(1)} heure(s)</div>
    </>
  );
}
