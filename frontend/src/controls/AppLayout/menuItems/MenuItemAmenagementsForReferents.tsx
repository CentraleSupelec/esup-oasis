/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { NavigateFunction } from "react-router-dom";
import { Button, MenuProps } from "antd";
import React from "react";

/**
 * Creates the menu items for the "Bénéficiaires" menu item.
 *
 * @param setSelectedKey
 * @param {Function} navigate - The navigate function to be called when a menu item is clicked.
 * @return {Array} - An array of menu item objects.
 */
export const menuItemAmenagementsForReferents = (
  setSelectedKey: (key: string) => void,
  navigate: NavigateFunction,
): MenuProps["items"] => [
  {
    key: "beneficiaires",
    className: "mr-auto",
    children: [],
    popupClassName: "d-none",
    label: (
      <Button
        type="text"
        className="no-hover p-0"
        onClick={() => {
          setSelectedKey("beneficiaires");
          navigate("/amenagements?mode=beneficiaire");
        }}
      >
        Aménagements
      </Button>
    ),
  },
];
