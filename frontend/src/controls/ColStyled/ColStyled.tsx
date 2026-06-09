/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { CSSProperties, ReactElement } from "react";
import { Col } from "antd";
import { ColProps, ColSize } from "antd/lib/grid/col";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";

declare type ColSpanType = number | string;
declare type FlexType = number | "none" | "auto" | string;

export interface ColSizeStyled {
  flex?: FlexType;
  span?: ColSpanType;
  order?: ColSpanType;
  offset?: ColSpanType;
  push?: ColSpanType;
  pull?: ColSpanType;
  style?: CSSProperties;
}

type ColPropsStyledItem = ColSpanType | ColSize | ColSizeStyled;

export interface ColPropsStyled extends ColProps {
  xs?: ColPropsStyledItem;
  sm?: ColPropsStyledItem;
  md?: ColPropsStyledItem;
  lg?: ColPropsStyledItem;
  xl?: ColPropsStyledItem;
  xxl?: ColPropsStyledItem;
}

function isColSizeStyled(object: unknown): object is ColSizeStyled {
  return object instanceof Object && "style" in object;
}

/**
 * Renders a responsive column with custom styling based on the current breakpoint(s).
 *
 * @param {React.PropsWithChildren<ColPropsStyled>} props - The properties passed to the component.
 * @returns {ReactElement} - The rendered responsive column with custom styling.
 */
export default function ColStyled(props: React.PropsWithChildren<ColPropsStyled>): ReactElement {
  const currentScreens = Object.entries(useBreakpoint())
    .filter((s) => s[1])
    .map((s) => s[0]);

  const style = currentScreens.reduce((acc, screen) => {
    const prop = props[screen as keyof ColPropsStyled];
    if (prop && isColSizeStyled(prop)) {
      return {
        ...acc,
        ...prop.style,
      };
    }
    return acc;
  }, {});

  return (
    <Col {...props} style={style}>
      {props.children}
    </Col>
  );
}
