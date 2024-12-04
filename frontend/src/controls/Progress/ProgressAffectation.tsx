/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useMemo } from "react";
import { Evenement } from "../../lib/Evenement";
import Progress from "./Progress";

interface IProgressAffectation {
   evenements: Evenement[];
}

/**
 * Calculates and renders the progress of event affectation based on provided events.
 *
 * @param {IProgressAffectation} props - The properties object containing the events.
 * @param {Array<Event>} props.evenements - The list of events to calculate affectation progress.
 *
 * @return {ReactElement} - The progress component displaying the affectation progress.
 */
export default function ProgressAffectation({ evenements }: IProgressAffectation): ReactElement {
   return useMemo(() => {
      const evts = evenements.filter((e) => !e.dateAnnulation)
      const taux =
         evenements.length === 0
            ? 100
            : Math.round(
                 (100 *
                     evts.filter((e) => e.isAffecte())
                       .length) /
                 evts.length,
              );

      return (
         <Progress
            value={taux}
            tooltip={`Taux d'affectation des évènements : ${taux.toString(10)}%`}
         />
      );
   }, [evenements]);
}
