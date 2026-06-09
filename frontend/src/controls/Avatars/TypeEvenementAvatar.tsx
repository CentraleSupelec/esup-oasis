/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { Avatar } from "antd";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { ITypeEvenement, PREFETCH_TYPES_EVENEMENTS } from "@api";

interface IAvatarTypeEvenement {
  typeEvenement?: ITypeEvenement;
  typeEvenementId?: string;
  size?: number;
  className?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const TypeEvenementAvatar = memo(
  ({
    typeEvenement,
    typeEvenementId,
    size,
    className,
    icon,
    style,
  }: IAvatarTypeEvenement): ReactElement => {
    const { data: typesEvenements, isFetching } =
      useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);

    const { accessibilite: appAccessibilite } = useAccessibilite();

    const typeEvenementData =
      typeEvenement ?? typesEvenements?.items.find((t) => t["@id"] === typeEvenementId);

    if (isFetching || !typeEvenementData) {
      return (
        <div className={className}>
          <Spinner />
        </div>
      );
    }

    return (
      <Avatar
        data-testid={typeEvenementData?.libelle}
        size={size}
        aria-hidden
        className={className}
        icon={icon}
        style={{
          ...style,
          backgroundColor: appAccessibilite.contrast
            ? `var(--color-dark-${typeEvenementData?.couleur})`
            : `var(--color-${typeEvenementData?.couleur})`,
        }}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.typeEvenementId === nextProps.typeEvenementId &&
    JSON.stringify(prevProps.typeEvenement) === JSON.stringify(nextProps.typeEvenement),
);
