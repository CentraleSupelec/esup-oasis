/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { Space, Spin, Tag, Tooltip } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { IEtatDemande, PREFETCH_ETAT_DEMANDE } from "@api";
import { getEtatDemandeInfo } from "@lib";
import { DerniereModifDemandeLabel } from "@controls/Avatars/DerniereModifDemandeLabel";

interface IEtatDemandeAvatar {
  etatDemande?: IEtatDemande;
  etatDemandeId?: string | null;
  afficherDerniereModification?: boolean;
  demandeId?: string;
  className?: string;
}

export const EtatDemandeAvatar: React.FC<IEtatDemandeAvatar> = memo(
  ({
    etatDemande,
    etatDemandeId,
    afficherDerniereModification,
    demandeId,
    className,
  }: IEtatDemandeAvatar): ReactElement => {
    const { data: dataEtatDemande, isFetching } =
      useApi().useGetFullCollection(PREFETCH_ETAT_DEMANDE);

    const item = etatDemande ?? dataEtatDemande?.items.find((t) => t["@id"] === etatDemandeId);
    const etatDemandeInfo = item ? getEtatDemandeInfo(item["@id"] as string) : undefined;

    if (isFetching || item === undefined) {
      return <Spin />;
    }

    if (afficherDerniereModification) {
      return (
        <Space orientation="vertical" size={2}>
          <Tooltip title={item?.libelle}>
            <Tag
              className={className}
              icon={etatDemandeInfo?.icone}
              color={etatDemandeInfo?.color}
              aria-label={`l'état de la demande est : ${item.libelle}`}
            >
              {item.libelle}
            </Tag>
          </Tooltip>
          <DerniereModifDemandeLabel demandeId={demandeId} />
        </Space>
      );
    }

    return (
      <Tooltip title={item?.libelle}>
        <Tag
          className={className}
          icon={etatDemandeInfo?.icone}
          color={etatDemandeInfo?.color}
          aria-label={`l'état de la demande est : ${item.libelle}`}
        >
          {item.libelle}
        </Tag>
      </Tooltip>
    );
  },
  (prevProps, nextProps) =>
    prevProps.etatDemandeId === nextProps.etatDemandeId &&
    JSON.stringify(prevProps.etatDemande) === JSON.stringify(nextProps.etatDemande),
);
