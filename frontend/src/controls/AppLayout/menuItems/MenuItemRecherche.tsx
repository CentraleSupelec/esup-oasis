/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Dispatch } from "redux";
import { UseStateDispatch } from "../../../utils/utils";
import { RoleValues, Utilisateur } from "../../../lib/Utilisateur";
import { NavigateFunction } from "react-router-dom";
import { Button, MenuProps, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import BeneficiaireIntervenantSearchDrawer from "../../Drawers/BeneficiaireIntervenant/BeneficiaireIntervenantSearchDrawer";
import { setDrawerUtilisateur } from "../../../redux/actions/Drawers";
import React from "react";

/**
 * Returns an array containing menu item for recherche option.
 *
 * @param {Dispatch} dispatch - The dispatch function used for updating state.
 * @param {boolean} modeRecherche - The current mode of recherche.
 * @param {UseStateDispatch<boolean>} setModeRecherche - The state setter function for updating the mode of recherche.
 *
 * @param utilisateur
 * @param navigate
 * @return {MenuProps["items"]} - An array containing menu item for Recherche option.
 */
export const menuItemRecherche = (
   dispatch: Dispatch,
   modeRecherche: boolean,
   setModeRecherche: UseStateDispatch<boolean>,
   utilisateur: Utilisateur,
   navigate: NavigateFunction,
): MenuProps["items"] => [
   {
      key: "rechercher",
      icon: (
         <Tooltip title="Rechercher un demandeur, un bénéficiaire ou un intervenant à partir de son nom, son prénom ou son email">
            <Button
               type="text"
               className="bg-transparent"
               aria-label="Rechercher un étudiant"
               onClick={() => setModeRecherche(!modeRecherche)}
            >
               <SearchOutlined aria-hidden style={{ verticalAlign: "sub" }} />
            </Button>
         </Tooltip>
      ),
      className: `ml-auto recherche ${modeRecherche ? "recherche-en-cours" : ""} hide-on-overflow${
         modeRecherche ? "" : " menu-small-item no-indicator"
      }`,
      children: [],
      popupClassName: "d-none",
      label: modeRecherche ? (
         <BeneficiaireIntervenantSearchDrawer
            style={{ minWidth: 180 }}
            utilisateur={utilisateur}
            onSelect={(individuId, role) => {
               function proceed(type: string) {
                  if (utilisateur.isGestionnaire) {
                     navigate(individuId?.replace("/utilisateurs", type) as string);
                  } else {
                     dispatch(
                        setDrawerUtilisateur({
                           utilisateur: individuId,
                           role: role,
                        }),
                     );
                  }
               }

               switch (role) {
                  case RoleValues.ROLE_DEMANDEUR:
                     proceed("/demandeurs");
                     break;
                  case RoleValues.ROLE_BENEFICIAIRE:
                     proceed("/beneficiaires");
                     break;
                  case RoleValues.ROLE_INTERVENANT:
                     if (role)
                        dispatch(
                           setDrawerUtilisateur({
                              utilisateur: individuId,
                              role: role,
                           }),
                        );
               }

               setModeRecherche(false);
            }}
         />
      ) : undefined,
   },
];
