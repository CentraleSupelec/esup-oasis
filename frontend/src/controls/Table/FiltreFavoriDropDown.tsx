/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { App, Button, Dropdown, Flex } from "antd";
import { CaretDownOutlined, HeartOutlined } from "@ant-design/icons";
import React from "react";
import { FiltreDecrivable } from "@controls/Table/FiltreDescription";
import { usePreferences } from "@context/utilisateurPreferences/UtilisateurPreferencesProvider";

import { UseStateDispatch } from "@utils/utils";

export function FiltreFavoriDropDown<T extends FiltreDecrivable>(props: {
  setFiltre: UseStateDispatch<T>;
  filtreType: string;
  className?: string;
}) {
  const { message } = App.useApp();
  const { getPreferenceArray } = usePreferences();

  return (
    <Dropdown
      className={props.className}
      menu={{
        items: getPreferenceArray(props.filtreType).map((f) => ({
          key: f.nom,
          label: (
            <Button
              type="text"
              className="no-hover"
              onClick={(e) => {
                e.stopPropagation();
                props.setFiltre(f.filtre as T);
                message.info(`Filtre "${f.nom}" appliqué`).then();
              }}
            >
              {f.nom}
            </Button>
          ),
        })),
      }}
    >
      <Flex className={props.className} gap={3}>
        <HeartOutlined />
        {getPreferenceArray(props.filtreType).length > 0 && <CaretDownOutlined />}
      </Flex>
    </Dropdown>
  );
}
