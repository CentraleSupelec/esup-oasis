/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Checkbox, Space } from "antd";
import { TypeEvenementAvatar } from "@controls/Avatars/TypeEvenementAvatar";
import { CheckOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { PREFETCH_TYPES_EVENEMENTS } from "@api";
import { useEffectiveTheme } from "@utils/theme/useEffectiveTheme";

interface ICategoriesFilter {
  value?: string[];
  setValue: (value: string[]) => void;
}

/**
 * Filter component for types of events.
 * @param {Object} param - The parameter object.
 * @param {Array} param.value - The array of selected values.
 * @param {Function} param.setValue - The function to set the selected values.
 * @returns {ReactElement} - The JSX element of the filter component.
 */
export default function TypeEvenementFilter({ value, setValue }: ICategoriesFilter): ReactElement {
  const { data } = useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);
  const { accessibilite: appAccessibilite } = useAccessibilite();
  const isDark = useEffectiveTheme() === "dark";

  return (
    <>
      <Checkbox.Group
        value={value}
        className="checkbox-group-vertical"
        onChange={(checkedValues) => {
          setValue(checkedValues.map((val) => val as string));
        }}
      >
        {data?.items
          .filter((c) => c.actif && !c.forfait)
          .map((c) => (
            <Checkbox
              key={c["@id"]}
              value={c["@id"]}
              className={`border-radius checkbox-hide-check bg-white-hover border-radius checkbox-${c.couleur}`}
              style={{
                color: isDark
                  ? `var(--color-light-${c.couleur})`
                  : `var(--color-dark-${c.couleur})`,
                margin: "6px 0px",
                padding: "2px 0",
              }}
            >
              <Space align="center" className="w-100">
                <TypeEvenementAvatar
                  size={28}
                  typeEvenement={c}
                  icon={
                    value?.includes(c["@id"] as string) ? (
                      <CheckOutlined
                        style={{
                          color: appAccessibilite.contrast
                            ? "#FFF"
                            : `var(--color-dark-${c.couleur})`,
                        }}
                      />
                    ) : null
                  }
                />
                <span>{c.libelle}</span>
              </Space>
            </Checkbox>
          ))}
      </Checkbox.Group>
    </>
  );
}
