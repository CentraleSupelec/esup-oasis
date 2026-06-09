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

export const EllipsisMiddle: React.FC<{
  suffixCount: number;
  content: string;
  style?: React.CSSProperties;
  className?: string;
  expandable?: boolean;
}> = ({ suffixCount, content, style, className, expandable }) => {
  const start = content.slice(0, content.length - suffixCount);
  const suffix = content.slice(-suffixCount);
  const [expanded, setExpanded] = React.useState<boolean>(false);

  if (content.length <= suffixCount) {
    return (
      <Typography.Text
        className={className}
        style={{ maxWidth: "100%", ...style }}
        ellipsis={{ tooltip: content }}
      >
        {content}
      </Typography.Text>
    );
  }

  return (
    <Typography.Paragraph
      className={`mb-0 ${expandable ? "pointer" : ""} ${className}`}
      style={{ maxWidth: "100%", ...style }}
      ellipsis={{
        suffix,
        tooltip: !expanded ? content : undefined,
        symbol: null,
        expanded: expanded,
        expandable: expandable ? "collapsible" : false,
        onExpand: (_e, info) => setExpanded(info.expanded),
      }}
      onClick={() => (expandable ? setExpanded(!expanded) : null)}
    >
      {start}
    </Typography.Paragraph>
  );
};
