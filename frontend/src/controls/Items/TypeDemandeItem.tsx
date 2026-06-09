/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { ITypeDemande } from "@api";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { Flex, Popover, Space } from "antd";
import { CampagneDemandeDateItem } from "./CampagneDemandeDateItem";
import { InfoCircleOutlined } from "@ant-design/icons";
import TypeDemandeAvatar from "@controls/Avatars/TypeDemandeAvatar";
import { ProfilItem } from "./ProfilItem";

export function TypeDemandeItem(props: {
  typeDemande?: ITypeDemande;
  typeDemandeId?: string;
  showInfos?: boolean;
  showAvatar?: boolean;
  as?: "Space" | "Flex";
  className?: string;
}) {
  const { data: typeDemandeData } = useApi().useGetItem({
    path: "/types_demandes/{id}",
    url: props.typeDemandeId as string,
    enabled: !!props.typeDemandeId,
  });
  const item = props.typeDemande ?? typeDemandeData;

  function getDescription(typeDemande: ITypeDemande) {
    if (typeDemande.campagneEnCours)
      return (
        <CampagneDemandeDateItem
          campagneDemandeId={typeDemande.campagneEnCours}
          templateString="Campagne ouverte du {{debut}} au {{fin}}."
        />
      );

    if (typeDemande.campagneSuivante) {
      return (
        <CampagneDemandeDateItem
          campagneDemandeId={typeDemande.campagneSuivante}
          templateString="Campagne fermée. Prochaine campagne du {{debut}} au {{fin}}."
        />
      );
    }

    if (typeDemande.campagnePrecedente) {
      return (
        <CampagneDemandeDateItem
          campagneDemandeId={typeDemande.campagnePrecedente}
          templateString="Campagne fermée depuis le {{fin}}."
        />
      );
    }

    return "Aucune campagne ouverte.";
  }

  if (!item) return <Spinner />;

  if (!props.as || props.as === "Space")
    return (
      <Space className={props.className}>
        {props.showAvatar !== false && <TypeDemandeAvatar typeDemande={item} />}
        <span>{item.libelle}</span>
        {props.showInfos && (
          <Popover
            content={
              <Space orientation="vertical">
                <span>{getDescription(item)}</span>
                <Space>
                  <div className="semi-bold mt-1">Profils ciblés</div>
                  <span>
                    <ProfilItem profils={item.profilsCibles} />
                  </span>
                </Space>
              </Space>
            }
            title={item.libelle}
          >
            <InfoCircleOutlined className="text-light fs-09" />
          </Popover>
        )}
      </Space>
    );

  return (
    <Flex justify="space-between" align="center" gap={8} className={props.className}>
      {props.showAvatar !== false && <TypeDemandeAvatar typeDemande={item} />}
      <span>{item.libelle}</span>
      {props.showInfos && (
        <Popover
          content={
            <Space orientation="vertical">
              <span>{getDescription(item)}</span>
              <Space>
                <div className="semi-bold mt-1">Profils ciblés</div>
                <span>
                  <ProfilItem profils={item.profilsCibles} />
                </span>
              </Space>
            </Space>
          }
          title={item.libelle}
        >
          <InfoCircleOutlined className="text-light fs-09" />
        </Popover>
      )}
    </Flex>
  );
}
