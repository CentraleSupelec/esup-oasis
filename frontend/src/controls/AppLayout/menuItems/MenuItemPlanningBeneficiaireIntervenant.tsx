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
 * Generates the menu items for the beneficiary/intervenant planning menu.
 *
 * @param setSelectedKey
 * @param navigate - The function to navigate to a specific page.
 * @param className - Optional class name for the menu item.
 * @returns An array of menu items for the beneficiary/intervenant planning menu.
 */
export function menuItemPlanningBeneficiaireIntervenant(
  setSelectedKey: (key: string) => void,
  navigate: NavigateFunction,
  className?: string,
): MenuProps["items"] {
  return [
    {
      key: "planning",
      label: (
        <Button
          type="text"
          className="no-hover p-0"
          onClick={() => {
            setSelectedKey("planning");
            navigate("/planning");
          }}
        >
          Planning
        </Button>
      ),
      className: className,
      children: [],
      popupClassName: "d-none",
    },
  ];
}
