/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement, useEffect, useState } from "react";
import { Space, Spin, Tag, Tooltip } from "antd";
import { useApi } from "../../context/api/ApiProvider";
import { PREFETCH_ETAT_DEMANDE } from "../../api/ApiPrefetchHelpers";
import { IEtatDemande } from "../../api/ApiTypeHelpers";
import { EtatInfo, getEtatDemandeInfo } from "../../lib/demande";
import { DerniereModifDemandeLabel } from "./DerniereModifDemandeLabel";

interface IEtatDemandeAvatar {
   etatDemande?: IEtatDemande;
   etatDemandeId?: string;
   afficherDerniereModification?: boolean;
   demandeId?: string;
   className?: string;
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
export const EtatDemandeAvatar: React.FC<IEtatDemandeAvatar> = memo(
   ({
      etatDemande,
      etatDemandeId,
      afficherDerniereModification,
      demandeId,
      className,
   }: IEtatDemandeAvatar): ReactElement => {
      const [item, setItem] = useState<IEtatDemande | undefined>(etatDemande);
      const { data: dataEtatDemande, isFetching } =
         useApi().useGetCollection(PREFETCH_ETAT_DEMANDE);

      const [etatDemandeInfo, setEtatDemandeInfo] = useState<EtatInfo>();

      useEffect(() => {
         if (dataEtatDemande && etatDemandeId) {
            setItem(dataEtatDemande.items.find((t) => t["@id"] === etatDemandeId));
         }
         // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [dataEtatDemande, etatDemandeId]);

      useEffect(() => {
         if (etatDemande) setItem(etatDemande);
      }, [etatDemande]);

      useEffect(() => {
         if (item) setEtatDemandeInfo(getEtatDemandeInfo(item["@id"] as string));
      }, [item]);

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
