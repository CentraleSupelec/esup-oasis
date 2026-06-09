/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import UtilisateurAvatarImage from "@controls/Avatars/UtilisateurAvatarImage";
import { Utilisateur } from "@lib";

interface UtilisateurDrawerHeaderProps {
  utilisateur: Utilisateur;
}

export default function UtilisateurDrawerHeader({ utilisateur }: UtilisateurDrawerHeaderProps) {
  return (
    <Space orientation="vertical" className="text-center w-100 mb-3 mt-1">
      <UtilisateurAvatarImage
        utilisateurId={utilisateur["@id"] as string}
        height={220}
        as="img"
        fallback={<UserOutlined />}
        style={{ fontSize: 128 }}
        desactiverLazyLoading
      />
      <span className="fs-15 semi-bold">
        {`${utilisateur.prenom} ${utilisateur.nom?.toLocaleUpperCase()}`}
      </span>
    </Space>
  );
}
