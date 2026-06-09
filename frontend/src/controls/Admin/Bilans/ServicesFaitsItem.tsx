/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Typography } from "antd";
import { GestionnaireItem } from "@controls/Items/GestionnaireItem";
import { PeriodeRhItem } from "@controls/Items/PeriodeRhItem";
import { useApi } from "@context/api/ApiProvider";
import dayjs from "dayjs";
import Spinner from "@controls/Spinner/Spinner";
import { ServicesFaitsDetailsTable } from "@controls/Table/ServicesFaitsDetailsTable";
import { IPeriode } from "@api";

interface ServicesFaitsModaleProps {
  periode: IPeriode;
}

/**
 * Renders a component to display the details of a ServicesFaitsItem.
 *
 * @param {Object} ServicesFaitsModaleProps - The properties of the ServicesFaitsModale component.
 * @param {IPeriode} ServicesFaitsModaleProps.periode - The periode object passed to the component.
 *
 * @return {ReactElement} A React component to display the ServicesFaitsItem details.
 */
export function ServicesFaitsItem({ periode }: ServicesFaitsModaleProps): ReactElement {
  const { data: servicesFaits, isFetching } = useApi().useGetItem({
    path: "/periodes/{id}/services_faits",
    parameters: {
      id: periode["@id"] as string,
    },
  });

  return (
    <>
      <Typography.Title level={5}>
        Période : <PeriodeRhItem periodeId={periode["@id"]} />
      </Typography.Title>
      <Typography.Paragraph>
        Envoi à la RH : le {dayjs(periode.dateEnvoi as string).format("DD/MM/YYYY")} par{" "}
        <GestionnaireItem showAvatar={false} gestionnaireId={periode.utilisateurEnvoi as string} />
      </Typography.Paragraph>
      {servicesFaits ? (
        <ServicesFaitsDetailsTable servicesFaits={servicesFaits} isFetching={isFetching} />
      ) : (
        <Spinner />
      )}
    </>
  );
}
