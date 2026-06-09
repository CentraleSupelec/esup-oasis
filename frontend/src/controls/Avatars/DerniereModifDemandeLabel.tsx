/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { Alert, Space, Spin } from "antd";
import { useApi } from "@context/api/ApiProvider";

interface IDerniereModifDemandeLabel {
  demandeId?: string;
  title?: string;
  classNameTitle?: string;
  classNameValue?: string;
  ifEmpty?: React.ReactElement;
  asAlert?: boolean;
}

/**
 * React an etat demande avatar.
 *
 * @component
 * @param {IEtatDemandeAvatar} props - The component props.
 * @param {IEtatDemande} [props.etatDemande] - The etatDemande object.
 * @param {string} [props.etatDemandeId] - The ID of the etatDemande.
 * @returns {ReactElement} - The rendered component.
 */
export const DerniereModifDemandeLabel: React.FC<IDerniereModifDemandeLabel> = memo(
  ({
    demandeId,
    title,
    classNameTitle,
    classNameValue,
    ifEmpty,
    asAlert,
  }: IDerniereModifDemandeLabel): ReactElement => {
    const { data: dernModif, isFetching } = useApi().useGetCollection({
      path: "/demandes/{demandeId}/modifications",
      query: {
        "order[dateModification]": "desc",
        page: 1,
        itemsPerPage: 1,
      },
      parameters: {
        demandeId: demandeId as string,
      },
      enabled: demandeId !== undefined,
    });

    if (isFetching || dernModif === undefined) {
      return <Spin />;
    }

    if (dernModif && (dernModif?.items || []).length > 0 && dernModif.items[0].commentaire) {
      if (asAlert) {
        return (
          <Alert
            className="mt-2"
            type="info"
            title={title || "Complément d'information"}
            description={
              <span className={classNameValue}>{dernModif.items[0].commentaire ?? ifEmpty}</span>
            }
          />
        );
      }

      return (
        <Space>
          <span className={classNameTitle}>
            {title === undefined ? "Complément d'information :" : title}
          </span>
          <span className={classNameValue}>{dernModif.items[0].commentaire ?? ifEmpty}</span>
        </Space>
      );
    }

    return <></>;
  },
  (prevProps, nextProps) => prevProps.demandeId === nextProps.demandeId,
);
