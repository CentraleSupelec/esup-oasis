/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { RoleValues, Utilisateur } from "@lib";
import { Breakpoint, Space } from "antd";
import Spinner from "@controls/Spinner/Spinner";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { MinusOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import { entiteParent, IUtilisateur } from "@api";
import { UtilisateurContent } from "./UtilisateurItemContent";
import UtilisateurAvatarImage from "@controls/Avatars/UtilisateurAvatarImage";

interface IItemEtudiant {
  utilisateur?: IUtilisateur;
  utilisateurId?: string;
  profilBeneficiaireId?: string;

  showAvatar?: boolean;
  showEmail?: boolean;
  showTelephone?: boolean;
  responsive?: Breakpoint;
  role?: RoleValues;
  highlight?: string;
}

/**
 * EtudiantItem component.
 */
function EtudiantItem({
  utilisateur,
  utilisateurId,
  showAvatar = true,
  showEmail = false,
  showTelephone = false,
  responsive,
  profilBeneficiaireId,
  role,
  highlight,
}: IItemEtudiant): ReactElement {
  const effectiveId = profilBeneficiaireId ? entiteParent(profilBeneficiaireId) : utilisateurId;
  const { data } = useApi().useGetItem({
    path: "/utilisateurs/{uid}",
    url: effectiveId as string,
    enabled: !!effectiveId,
  });
  const item = utilisateur ?? data;
  const screens = useBreakpoint();

  if (!utilisateur && !effectiveId) return <MinusOutlined aria-label="Aucun utilisateur" />;

  if (!item) return <Spinner />;

  const user = new Utilisateur(item);

  return (
    <Space>
      {showAvatar && (!responsive || screens[responsive]) && (
        <UtilisateurAvatarImage
          as="img"
          width={48}
          utilisateur={item as IUtilisateur}
          size={48}
          role={role || user.roleCalcule}
          className="border-0"
        />
      )}
      <UtilisateurContent
        utilisateur={item}
        showEmail={showEmail}
        showTelephone={showTelephone}
        highlight={highlight}
      />
    </Space>
  );
}

const EtudiantItemMemo = memo(
  EtudiantItem,
  (prev, next) =>
    prev.utilisateurId === next.utilisateurId &&
    prev.utilisateur?.["@id"] === next.utilisateur?.["@id"] &&
    prev.profilBeneficiaireId === next.profilBeneficiaireId &&
    prev.showAvatar === next.showAvatar &&
    prev.showEmail === next.showEmail &&
    prev.showTelephone === next.showTelephone &&
    prev.highlight === next.highlight,
);
export { EtudiantItemMemo as EtudiantItem };
