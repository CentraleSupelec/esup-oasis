/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement } from "react";
import { Badge, Button, Popover, Space } from "antd";
import {
  getColor,
  MATERIAL_COLORS_NAMES,
  MaterialColorAmount,
  MaterialColorName,
  MaterialColorsTraductions,
} from "@utils/colors";
import { EventColors } from "@lib";
import "@controls/ColorPicker/ColorPicker.scss";

interface ICouleur {
  value: string;
  label: string;
  color: string;
}

interface IColorPicker {
  value?: MaterialColorName;
  onChange?: (v: string) => void;
  className?: string;
  disabled?: boolean;
}

// --- Dropdown color picker
/**
 * ColorPicker component for Material Design colors.
 *
 * @param {Object} props - The props object
 * @param {string} props.value - The current selected color value
 * @param {Function} [props.onChange] - The callback function to handle color value changes
 * @param {string} [props.className] - The CSS classname for styling the component
 * @param {boolean} [props.disabled] - Specifies whether the component is disabled or not
 * @returns {ReactElement} The ColorPicker component
 */
export default memo(
  function ColorPicker({ value, onChange, className, disabled }: IColorPicker): ReactElement {
    const couleurs: ICouleur[] = React.useMemo(() => {
      return Object.values(MATERIAL_COLORS_NAMES).map((colorName) => {
        return {
          value: colorName,
          label: MaterialColorsTraductions[colorName],
          color: getColor(colorName, EventColors.Affected),
        } as ICouleur;
      });
    }, []);

    const couleurSelectionnee = React.useMemo(() => {
      return value ? couleurs.find((c) => c.value === value) : undefined;
    }, [value, couleurs]);

    function getColorItem(color: ICouleur) {
      return (
        <Button
          ghost
          className={`border-0 ${className}`}
          style={{
            color: getColor(color.value as MaterialColorName, "700" as MaterialColorAmount),
          }}
          disabled={disabled}
          icon={<Badge className="big-badge w-100" color={color?.color || "black"} />}
          onClick={() => {
            if (typeof onChange === "function") {
              onChange(color.value);
            }
          }}
        >
          {color.label}
        </Button>
      );
    }

    function getColorsPanel() {
      return couleurs.map((c) => getColorItem(c));
    }

    return (
      <>
        <Popover
          content={getColorsPanel()}
          title="Couleur de la catégorie d'évènements"
          trigger="hover"
          placement="bottom"
          classNames={{ root: "w-50" }}
        >
          <Button
            className="ml-0 border-2"
            style={{
              borderColor: couleurSelectionnee ? couleurSelectionnee?.color : "black",
            }}
          >
            <Space separator>
              <Badge
                className="big-badge w-100"
                color={couleurSelectionnee?.color || "black"}
                text={couleurSelectionnee?.label || "Aucune couleur sélectionnée"}
                style={{
                  color: couleurSelectionnee
                    ? getColor(
                        couleurSelectionnee?.value as MaterialColorName,
                        "600" as MaterialColorAmount,
                      )
                    : "black",
                }}
              />
            </Space>
          </Button>
        </Popover>
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.value === nextProps.value && prevProps.disabled === nextProps.disabled,
);
