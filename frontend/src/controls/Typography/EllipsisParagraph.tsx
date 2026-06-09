/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Typography } from "antd";

export const EllipsisParagraph: React.FC<{
  content: string;
  className?: string;
  type?: "secondary" | "success" | "warning" | "danger";
}> = ({ content, className, type }) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  return (
    <Typography.Paragraph
      type={type}
      className={`pointer ${className}`}
      ellipsis={{
        rows: 2,
        expandable: "collapsible",
        symbol: expanded ? "moins" : "plus",
        expanded: expanded,
        tooltip: !expanded ? content : undefined,
        onExpand: (_e, info) => setExpanded(info.expanded),
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {content}
    </Typography.Paragraph>
  );
};
