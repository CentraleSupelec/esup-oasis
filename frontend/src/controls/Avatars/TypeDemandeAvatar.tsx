/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ITypeDemande } from "@api";
import { Avatar } from "antd";
import { LockFilled, UnlockOutlined } from "@ant-design/icons";
import React from "react";
import { useApi } from "@context/api/ApiProvider";

export default function TypeDemandeAvatar(props: {
  typeDemande?: ITypeDemande;
  typeDemandeId?: string;
}) {
  const { data: typeDemandeData } = useApi().useGetItem({
    path: "/types_demandes/{id}",
    url: props.typeDemandeId as string,
    enabled: !!props.typeDemandeId,
  });
  const item = props.typeDemande ?? typeDemandeData;

  if (!item) return null;

  if (item.campagneEnCours)
    return (
      <Avatar
        icon={<UnlockOutlined aria-hidden={true} />}
        style={{
          backgroundColor: "var(--color-success-light)",
          color: "var(--color-text)",
        }}
      />
    );

  if (item.campagneSuivante) {
    return <Avatar icon={<LockFilled aria-hidden={true} />} />;
  }

  if (item.campagnePrecedente) {
    return <Avatar icon={<LockFilled />} aria-hidden={true} />;
  }

  return null;
}
