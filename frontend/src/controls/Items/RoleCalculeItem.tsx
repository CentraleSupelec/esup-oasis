/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { getRoleLabel, RoleValues, Utilisateur } from "@lib";
import { Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { IUtilisateur } from "@api";

interface IItemRoleProps {
  role?: string;
  roles?: string[];
  className?: string;
}

/**
 * Renders the item's role tag.
 *
 * @param {Object} props - The properties for calculating the item role tag.
 * @param {string} [props.role] - The specific role for the item.
 * @param {Array<string>} [props.roles] - The roles associated with the item.
 * @returns {ReactElement} - The JSX element representing the calculated role tag.
 */
export function RoleCalculeItem({ role, roles, className }: IItemRoleProps): ReactElement {
  const utilisateur = new Utilisateur({ roles: role ? [role] : roles } as IUtilisateur);

  return (
    <Tag
      icon={<UserOutlined aria-hidden />}
      color={utilisateur.getRoleColor()}
      className={className}
    >
      {getRoleLabel(utilisateur.roleCalcule as RoleValues)}
    </Tag>
  );
}
