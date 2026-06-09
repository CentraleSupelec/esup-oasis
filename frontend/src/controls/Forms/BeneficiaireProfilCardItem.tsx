/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useState } from "react";
import { Avatar, Button, Card, Space, Tooltip } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { IBeneficiaireProfil, IUtilisateur, PREFETCH_PROFILS } from "@api";
import Spinner from "@controls/Spinner/Spinner";
import { getLibellePeriode, isEnCoursSurPeriode } from "@utils/dates";
import { CheckOutlined, EditOutlined, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { GestionnaireItem } from "@controls/Items/GestionnaireItem";
import { AccompagnementAvatar } from "@controls/Avatars/AccompagnementAvatar";
import { BeneficiaireProfilFormItemEdit } from "@controls/Forms/BeneficiaireProfilFormItemEdit";

interface IBeneficiaireProfilFormItemProps {
  value?: string;
  onChange?: (v: string | undefined) => void;
  style?: React.CSSProperties;
  className?: string;
  cardClassName?: string;
  cardSize?: "small" | "medium";
  placeholder?: string;
  extra?: React.ReactNode;
  utilisateur: IUtilisateur;
  onCancel?: () => void;
  selected?: boolean;
  onSelect?: (profil: string) => void;
  editable?: boolean;
}

function BeneficiaireProfilCardItem({
  value,
  cardClassName,
  extra,
  utilisateur,
  onCancel,
  selected,
  onSelect,
  editable = true,
  cardSize = "medium",
}: IBeneficiaireProfilFormItemProps) {
  const [profilEdited, setProfilEdited] = useState<IBeneficiaireProfil>();
  const { data: profils, isFetching: isFetchingProfils } =
    useApi().useGetFullCollection(PREFETCH_PROFILS);
  const { data, isFetching } = useApi().useGetItem({
    path: "/utilisateurs/{uid}/profils/{id}",
    url: value as string,
    enabled: !!value,
  });
  const { data: typologiesData, isFetching: isFetchingTypologiesData } =
    useApi().useGetFullCollection({
      path: "/typologies",
    });

  if (isFetching || isFetchingProfils || isFetchingTypologiesData) return <Spinner />;

  if (value === undefined || profilEdited)
    return (
      <BeneficiaireProfilFormItemEdit
        utilisateur={utilisateur}
        profilBeneficiaire={profilEdited}
        onEdited={() => setProfilEdited(undefined)}
        onCancel={() => {
          setProfilEdited(undefined);
          if (onCancel && !value) onCancel();
        }}
      />
    );

  const profil = profils?.items.find((p) => p["@id"] === data?.profil);

  return (
    <Card
      size={cardSize}
      className={`${cardClassName}${
        selected ? " bg-beneficiaire-light" : ""
      }${onSelect ? " pointer" : ""}`}
      onClick={() => {
        if (onSelect) onSelect(value);
      }}
    >
      <Card.Meta
        avatar={
          isEnCoursSurPeriode(data?.debut, data?.fin) ? (
            <Tooltip title="En cours" placement="left">
              <Avatar
                className="bg-success"
                size="small"
                icon={<CheckOutlined className="fs-08" aria-hidden />}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Terminé" placement="left">
              <Avatar
                size="small"
                icon={<PlusOutlined rotate={45} className="fs-08 text-text" aria-hidden />}
              />
            </Tooltip>
          )
        }
        title={
          <div style={{ whiteSpace: "normal", lineHeight: 1.25 }}>
            <Space className="float-right" size="small">
              {extra}
              {editable && (
                <Button type="text" icon={<EditOutlined />} onClick={() => setProfilEdited(data)} />
              )}
            </Space>
            {profil?.libelle}
            {profil?.avecTypologie && (
              <Tooltip
                title={data?.typologies
                  ?.map((t) => {
                    const typologie = typologiesData?.items.find((typo) => typo["@id"] === t);
                    return typologie?.libelle;
                  })
                  .join(", ")}
              >
                <InfoCircleOutlined className="ml-1 pointer" />
              </Tooltip>
            )}
          </div>
        }
        description={
          <Space orientation="vertical">
            {getLibellePeriode(data?.debut, data?.fin)}
            <Space wrap className="text-text">
              <span>Suivi par :</span>
              <span>
                <GestionnaireItem gestionnaireId={data?.gestionnaire} />
              </span>
            </Space>
            <Space wrap className="text-text">
              <span>
                <AccompagnementAvatar avecAccompagnement={data?.avecAccompagnement} libelle />
              </span>
            </Space>
          </Space>
        }
      />
    </Card>
  );
}

export default BeneficiaireProfilCardItem;
