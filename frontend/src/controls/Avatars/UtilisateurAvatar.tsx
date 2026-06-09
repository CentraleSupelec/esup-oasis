/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { Avatar, Tooltip } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { APIEndpointByRole, IUtilisateurBase, RoleValues } from "@lib";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";

interface IAvatarUtilisateur {
  utilisateur?: IUtilisateurBase;
  utilisateurId?: string;
  role: RoleValues;
  className?: string;
  inverserNomPrenom?: boolean;
  style?: React.CSSProperties;
  loading?: boolean;
  size?: "large" | "small" | "default" | number;
  withPhoto?: boolean;
  shape?: "circle" | "square";
  showTooltip?: boolean;
}

export const getRoleClassName = (role?: RoleValues) => {
  switch (role) {
    case RoleValues.ROLE_GESTIONNAIRE:
    case RoleValues.ROLE_ADMIN:
      return "bg-primary-light text-primary semi-bold";
    case RoleValues.ROLE_RENFORT:
      return "bg-renfort semi-bold";
    case RoleValues.ROLE_INTERVENANT:
      return "bg-intervenant semi-bold";
    case RoleValues.ROLE_BENEFICIAIRE:
      return "bg-beneficiaire semi-bold";
    case RoleValues.ROLE_DEMANDEUR:
      return "bg-demandeur semi-bold";
    default:
      return "bg-primary-light text-primary semi-bold";
  }
};

export const UtilisateurAvatar = memo(
  ({
    utilisateur,
    utilisateurId,
    role = RoleValues.ROLE_GESTIONNAIRE,
    className,
    inverserNomPrenom = false,
    style,
    loading,
    size,
    shape,
    showTooltip,
  }: IAvatarUtilisateur): ReactElement => {
    const { data, isFetching } = useApi().useGetItem({
      path: APIEndpointByRole(role),
      url: utilisateurId as string,
      enabled: utilisateurId !== undefined,
    });

    const utilisateurData = utilisateur ?? (data as IUtilisateurBase | undefined);

    if (loading) {
      return (
        <Avatar
          style={style}
          shape={shape ?? "square"}
          className={`cursor-default ${className || getRoleClassName(role)}`}
          aria-hidden
        >
          <Spinner size={16} className={`cursor-default ${className || getRoleClassName(role)}`} />
        </Avatar>
      );
    }

    if (isFetching || utilisateurData === undefined) {
      return (
        <Avatar
          style={style}
          shape={shape ?? "square"}
          className="bg-primary-light text-primary semi-bold"
          icon={<UserOutlined />}
          aria-hidden
        />
      );
    }

    return (
      <Tooltip
        title={
          showTooltip !== false
            ? `${utilisateurData.prenom} ${utilisateurData.nom?.toLocaleUpperCase()}`
            : undefined
        }
      >
        <Avatar
          size={size || "default"}
          shape={shape ?? "square"}
          style={style}
          data-testid={utilisateurData.nom}
          className={`cursor-default ${className || getRoleClassName(role)}`}
          aria-hidden
        >
          {inverserNomPrenom
            ? `${utilisateurData.nom?.[0].toLocaleUpperCase()}${utilisateurData.prenom?.[0].toLocaleUpperCase()}`
            : `${utilisateurData.prenom?.[0].toLocaleUpperCase()}${utilisateurData.nom?.[0].toLocaleUpperCase()}`}
        </Avatar>
      </Tooltip>
    );
  },
  (prevProps, nextProps) =>
    prevProps.utilisateurId === nextProps.utilisateurId &&
    prevProps.loading === nextProps.loading &&
    JSON.stringify(prevProps.utilisateur) === JSON.stringify(nextProps.utilisateur),
);
