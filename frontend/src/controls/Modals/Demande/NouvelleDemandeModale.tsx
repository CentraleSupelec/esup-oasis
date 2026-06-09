/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Modal } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { ITypeDemande } from "@api";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import React from "react";
import { useAuth } from "@/auth/AuthProvider";
import { TypesDemandesListItems } from "@controls/Modals/Demande/TypesDemandesListItems";

export default function NouvelleDemandeModale(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose?: () => Promise<void>;
}) {
  const screens = useBreakpoint();
  const auth = useAuth();
  const { data: typesDemandes } = useApi().useGetFullCollection({
    path: "/types_demandes",
    enabled: true,
  });

  const { data: demandes } = useApi().useGetFullCollection({
    path: "/demandes",
    query: { format_simple: true },
    enabled: true,
  });

  function getTypesDemandesPostulables(): ITypeDemande[] {
    return (typesDemandes?.items || []).filter((typeDemande) => {
      return (
        typeDemande.actif &&
        typeDemande.campagneEnCours &&
        demandes?.items.every((demande) => demande.campagne !== typeDemande.campagneEnCours)
      );
    });
  }

  function getTypesDemandesBientot(): ITypeDemande[] {
    return (typesDemandes?.items || []).filter((typeDemande) => {
      return (
        typeDemande.actif &&
        !typeDemande.campagneEnCours &&
        typeDemande.campagneSuivante &&
        demandes?.items.every((demande) => demande.campagne !== typeDemande.campagneSuivante)
      );
    });
  }

  if (!typesDemandes || !demandes) return null;
  if (!props.open) return null;

  return (
    <Modal
      centered
      title={<h2 className="m-0">Nouvelle demande</h2>}
      open={props.open}
      onCancel={() => {
        props.setOpen(false);
      }}
      onOk={() => {
        if (props.onClose === undefined) {
          props.setOpen(false);
          return;
        }

        props.onClose().then(() => {
          props.setOpen(false);
        });
      }}
      width={screens.lg ? 800 : "95%"}
      okText="Fermer"
      cancelButtonProps={{ style: { display: "none" } }}
    >
      <TypesDemandesListItems
        titre="Campagnes en cours"
        items={getTypesDemandesPostulables()}
        ajout={true}
        demandeurId={auth.user?.["@id"] as string}
      />
      {getTypesDemandesBientot().length > 0 && (
        <TypesDemandesListItems
          titre="Prochaines campagnes"
          items={getTypesDemandesBientot()}
          demandeurId={auth.user?.["@id"] as string}
          ajout={false}
        />
      )}
    </Modal>
  );
}
