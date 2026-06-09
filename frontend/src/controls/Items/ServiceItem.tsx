/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { Tag } from "antd";

interface IItemServiceProps {
  service?: string;
  services?: string[];
}

/**
 * Renders a list of service items.
 *
 * @param {Object} props - The props for the ServiceItem component.
 * @param {string} [props.service] - The selected service. If provided, only this service will be displayed.
 * @param {string[]} [props.services] - The list of services. If provided, all services will be displayed.
 *
 * @returns {ReactElement} - The rendered list of service items.
 */
export function ServiceItem({ service, services }: IItemServiceProps): ReactElement {
  const data = service ? [service] : services;
  const { data: dataServices, isFetching: isFetchingServices } = useApi().useGetFullCollection({
    path: "/services",
  });

  if (isFetchingServices || !data) return <Spinner />;

  return (
    <>
      {data.map((s) => {
        const serv = dataServices?.items.find((ob) => ob["@id"] === s);
        return (
          <Tag key={s} className="mb-1">
            {serv?.libelle}
          </Tag>
        );
      })}
    </>
  );
}
