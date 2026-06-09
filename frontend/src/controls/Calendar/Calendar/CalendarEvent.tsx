/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo } from "react";
import { Popover } from "antd";
import { CalendarEvenement } from "@lib";
import { useModals } from "@context/modals/ModalsContext";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { EllipsisMiddle } from "@controls/Typography/EllipsisMiddle";
import { CalendarEventPopoverContent } from "@controls/Calendar/Calendar/CalendarEventPopoverContent";
import { useCalendarEventDescription } from "@controls/Calendar/Calendar/useCalendarEventDescription";
import { CalendarEventDisplay } from "@controls/Calendar/Calendar/CalendarEventDisplay";

/**
 * Display a calendar event in a popover.
 *
 * @param {Object} param - The parameter object.
 * @param {memo<ReactElement>} param.event - The calendar event to display.
 */
export default memo(
  function CalendarEvent({ event }: { event: CalendarEvenement }) {
    const { modals: appModals } = useModals();
    const { accessibilite: appAccessibilite } = useAccessibilite();
    const { getDescriptionAccessible } = useCalendarEventDescription(event);

    return (
      <Popover
        key={event.data["@id"]}
        open={appModals.EVENEMENT_ID || appModals.EVENEMENT ? false : undefined}
        mouseEnterDelay={0.15}
        title={
          <h3 className="mt-1">
            <EllipsisMiddle
              content={event.data.libelle || "Évènement"}
              suffixCount={15}
              style={{ maxWidth: "90%" }}
            />
          </h3>
        }
        placement="left"
        content={<CalendarEventPopoverContent event={event} contrast={appAccessibilite.contrast} />}
      >
        <CalendarEventDisplay event={event} descriptionAccessible={getDescriptionAccessible()} />
      </Popover>
    );
  },
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps.event.data) === JSON.stringify(nextProps.event.data);
  },
);
