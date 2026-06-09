/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { rangeToLabel } from "@utils/dates";
import { Badge, List, Space } from "antd";
import dayjs from "dayjs";
import { IServicesFaits, IServicesFaitsLigne } from "@api";
import { to2Digits } from "@utils/number";

interface IServiceFaitItem {
  servicesFaits: IServicesFaits;
}

/**
 * Renders a service fait item for the dashboard.
 *
 * @param {IServicesFaits} servicesFaits - The services faits data.
 *
 * @return {ReactElement} The rendered service fait item component.
 */
export function ServiceFaitItem({ servicesFaits }: IServiceFaitItem): ReactElement {
  const range = rangeToLabel(
    new Date(servicesFaits.periode?.debut as string),
    new Date(servicesFaits.periode?.fin as string),
  );
  return (
    <List.Item>
      <List.Item.Meta
        title={range}
        description={
          <div className="mt-1">
            {servicesFaits.periode?.dateEnvoi ? (
              <Badge
                status="success"
                text={`Envoyé à la RH le ${dayjs(servicesFaits.periode?.dateEnvoi).format(
                  "DD/MM/YYYY",
                )}`}
              />
            ) : undefined}
            <br />
            <Space>
              {to2Digits(
                servicesFaits.lignes?.reduce((acc: number, ligne: IServicesFaitsLigne) => {
                  return (
                    acc +
                    parseFloat(ligne.nbHeures || "0") *
                      parseFloat(ligne.tauxHoraire?.montant || "0")
                  );
                }, 0),
              )}
              €
            </Space>
          </div>
        }
      />
    </List.Item>
  );
}
