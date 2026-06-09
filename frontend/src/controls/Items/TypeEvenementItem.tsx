/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Breakpoint, Space } from "antd";
import Spinner from "@controls/Spinner/Spinner";
import { TypeEvenementAvatar } from "@controls/Avatars/TypeEvenementAvatar";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useApi } from "@context/api/ApiProvider";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { ITypeEvenement, PREFETCH_TYPES_EVENEMENTS } from "@api";

interface IItemTypeEvenement {
  typeEvenement?: ITypeEvenement;
  typeEvenementId?: string;
  showAvatar?: boolean;
  responsive?: Breakpoint;
  size?: number;
  styleLibelle?: React.CSSProperties;
  forceBlackText?: boolean;
  className?: string;
}

/**
 * Renders an item for an event type.
 * @param {Object} param - The parameters object.
 * @param {ITypeEvenement} [param.typeEvenement] - The event type.
 * @param {string} [param.typeEvenementId] - The event type ID.
 * @param {boolean} [param.showAvatar=true] - Whether to show the avatar or not.
 * @param {string} [param.responsive] - The responsive breakpoint.
 * @param {string} [param.size] - The size of the avatar.
 * @param {Object} [param.styleLibelle] - The style for the label.
 * @param {boolean} [param.forceBlackText=false] - Whether to force black text or not.
 * @returns {ReactElement} - The rendered item component.
 */
export function TypeEvenementItem({
  typeEvenement,
  typeEvenementId,
  showAvatar = true,
  responsive,
  size,
  styleLibelle,
  forceBlackText = false,
  className,
}: IItemTypeEvenement): ReactElement {
  const { accessibilite: appAccessibilite } = useAccessibilite();
  const { data: typesEvenements } = useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);
  const item = typeEvenement ?? typesEvenements?.items.find((t) => t["@id"] === typeEvenementId);
  const screens = useBreakpoint();

  if (!item) return <Spinner />;

  return (
    <Space className={className}>
      {showAvatar && (!responsive || screens[responsive]) && (
        <TypeEvenementAvatar size={size} typeEvenementId={item?.["@id"]} />
      )}
      <div
        style={{
          ...styleLibelle,
          color: appAccessibilite.contrast
            ? appAccessibilite.contrast
              ? forceBlackText
                ? "#000"
                : `#FFF`
              : `var(--color-xlight-${item?.couleur})`
            : `var(--color-dark-${item?.couleur})`,
        }}
      >
        {item?.libelle}
      </div>
    </Space>
  );
}
