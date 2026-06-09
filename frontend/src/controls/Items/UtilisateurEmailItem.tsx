/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import Spinner from "@controls/Spinner/Spinner";
import { useApi } from "@context/api/ApiProvider";
import { IUtilisateur } from "@api";
import { MinusOutlined } from "@ant-design/icons";
import { Typography } from "antd";

interface IItemIntervenant {
  utilisateur?: IUtilisateur;
  utilisateurId?: string | null;
  emailPerso: boolean;
  onEdit?: (value: string) => void;
}

/**
 * Fetches the email of a user from the server using their ID.
 *
 * @param {Object} params - The parameters for fetching the email.
 * @param {IUtilisateur} [params.utilisateur] - The user object.
 * @param {string} [params.utilisateurId] - The ID of the user.
 * @return {string|ReactElement} The email of the user.
 */
export function UtilisateurEmailItem({
  utilisateur,
  utilisateurId,
  emailPerso,
  onEdit,
}: IItemIntervenant): string | ReactElement {
  const { data } = useApi().useGetItem({
    path: "/utilisateurs/{uid}",
    url: utilisateurId as string,
    enabled: !!utilisateurId,
  });
  const item = utilisateur ?? data;

  if (!utilisateur && !utilisateurId) return <></>;

  if (!item) return <Spinner />;

  const email = emailPerso ? item?.emailPerso : item?.email;

  if (onEdit)
    return (
      <Typography.Text
        editable={{
          text: email || "",
          onChange: onEdit,
        }}
      >
        {email || <MinusOutlined />}
      </Typography.Text>
    );

  return email || <MinusOutlined />;
}
