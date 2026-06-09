/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { lazy, ReactElement, Suspense } from "react";
import "@controls/Modals/AllModals.scss";
import { useAuth } from "@/auth/AuthProvider";
import { useModals } from "@context/modals/ModalsContext";

const EvenementModal = lazy(() => import("@controls/Modals/Evenement/EvenementModal"));
const EvenementResumeModal = lazy(() => import("@controls/Modals/Evenement/EvenementResumeModal"));

export default function AllModals(): ReactElement | null {
  const user = useAuth().user;
  const { modals: appModals } = useModals();

  if (user?.isPlanificateur) {
    return appModals.EVENEMENT || appModals.EVENEMENT_ID ? (
      <Suspense>
        <EvenementModal id={appModals.EVENEMENT_ID} initialEvenement={appModals.EVENEMENT} />
      </Suspense>
    ) : null;
  }

  return appModals.EVENEMENT_ID ? (
    <Suspense>
      <EvenementResumeModal id={appModals.EVENEMENT_ID} />
    </Suspense>
  ) : null;
}
