/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { lazy, ReactElement, Suspense } from "react";
import "@controls/Drawers/AllDrawers.scss";
import EvenementDrawer from "@controls/Drawers/Evenement/EvenementDrawer";

const UtilisateurDrawer = lazy(() => import("@controls/Drawers/Utilisateur/UtilisateurDrawer"));

export default function AllDrawers(): ReactElement {
  return (
    <>
      <EvenementDrawer />
      <Suspense>
        <UtilisateurDrawer />
      </Suspense>
    </>
  );
}
