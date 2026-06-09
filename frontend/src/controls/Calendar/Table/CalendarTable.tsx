/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Evenement } from "@lib";
import EvenementTable from "@controls/Table/EvenementTable";

interface CalendarTableProps {
  events: Evenement[];
  saisieEvtRenfort?: boolean;
}

/**
 * Generates a calendar table component.
 *
 * @param {Object} props - The configuration options for the calendar table.
 * @param {Evenement[]} props.events - The list of events to be displayed in the calendar table.
 * @param {boolean} [props.saisieEvtRenfort=false] - Whether to enable additional event input for reinforcement.
 *
 * @return {ReactElement} - The generated calendar table component.
 */
export default function CalendarTable({
  events,
  saisieEvtRenfort = false,
}: CalendarTableProps): ReactElement {
  return <EvenementTable events={events} saisieEvtRenfort={saisieEvtRenfort} />;
}
