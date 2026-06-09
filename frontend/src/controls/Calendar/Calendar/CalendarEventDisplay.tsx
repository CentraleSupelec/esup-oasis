/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Space, Tooltip } from "antd";
import { DeleteFilled, ToolOutlined, WarningFilled } from "@ant-design/icons";
import { CalendarEvenement } from "@lib";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";

interface CalendarEventDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  event: CalendarEvenement;
  descriptionAccessible: string;
}

export const CalendarEventDisplay: React.FC<CalendarEventDisplayProps> = ({
  event,
  descriptionAccessible,
  ...props
}) => {
  return (
    <div
      {...props}
      style={{ ...props.style, height: "100%" }}
      tabIndex={0}
      aria-label={descriptionAccessible}
    >
      <div className="libelle-evenement">
        {event.data.libelle ? (
          event.data.libelle
        ) : (
          <TypeEvenementItem
            typeEvenementId={event.data.type}
            showAvatar={false}
            forceBlackText={!event.data.isAffecte()}
          />
        )}
      </div>

      <Space className="note-bottom">
        {(event.data.equipements || []).length > 0 && (
          <Tooltip title="Equipement nécessaire">
            <ToolOutlined />
          </Tooltip>
        )}
        {event.data.dateAnnulation && (
          <Tooltip title="Évènement annulé">
            <DeleteFilled className="text-warning" />
          </Tooltip>
        )}
        {!event.data.isAffecte() && !event.data.dateAnnulation && (
          <Tooltip title="Évènement à affecter">
            <WarningFilled className="text-danger" />
          </Tooltip>
        )}
      </Space>
    </div>
  );
};
