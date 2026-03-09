/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useState } from "react";
import { Button, Layout, Space, Tooltip } from "antd";
import "./CalendarSider.scss";
import SmallCalendar from "./SmallCalendar/SmallCalendar";
import AffectationFilter, {
   AffectationFilterValues,
} from "../../Filters/Affectation/AffectationFilter";
import CampusFilter from "../../Filters/Campus/CampusFilter";
import TypeEvenementFilter from "../../Filters/TypeEvenement/TypeEvenementFilter";
import Icon, {
   CloseCircleFilled,
   LeftOutlined,
   RightOutlined,
   UserOutlined,
} from "@ant-design/icons";
import GestionnaireFilter from "../../Filters/Gestionnaire/GestionnaireFilter";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useAuth } from "../../../auth/AuthProvider";
import { ReactComponent as Asterisk } from "../../../assets/images/asterisk.svg";
import { IAffichageFiltres } from "../../../redux/context/IAffichageFiltres";
import { useDispatch, useSelector } from "react-redux";
import { IStore } from "../../../redux/Store";
import { setFiltres } from "../../../redux/actions/AffichageFiltre";
import { useApi } from "../../../context/api/ApiProvider";
import AnnulationFilter, {
   AnnulationFilterValues,
} from "../../Filters/Annulation/AnnulationFilter";
import { PREFETCH_TYPES_EVENEMENTS } from "../../../api/ApiPrefetchHelpers";
import BeneficiaireIntervenantFilter from "../../Filters/BeneficiaireIntervenant/BeneficiaireIntervenantFilter";
import { FiltresFavorisEvenements } from "./FiltresFavorisEvenements";
import { env } from "../../../env";

interface ICalendarSider {
   saisieEvtRenfort?: boolean;
}

/**
 * This function renders the sidebar component (filters) for the calendar page.
 *
 * @param {Object} params - The parameters for the sidebar component.
 * @param {boolean} [params.saisieEvtRenfort] - Indicates if renforcement event entry is enabled.
 *
 * @returns {ReactElement} The rendered sidebar component.
 */
export default function CalendarSider({ saisieEvtRenfort = false }: ICalendarSider): ReactElement {
   const auth = useAuth();
   const screens = useBreakpoint();
   const [collapsedSider, setCollapsedSider] = useState(false);
   const { data: dataTypesEvenements } = useApi().useGetCollection(PREFETCH_TYPES_EVENEMENTS);
   const appAffichageFiltres: IAffichageFiltres = useSelector(
      ({ affichageFiltres }: Partial<IStore>) => affichageFiltres,
   ) as IAffichageFiltres;
   const dispatch = useDispatch();

   // CSS pour formatage du label des filtres avec valeur
   const classNameByStatus = (
      value: string | number | Date | string[] | undefined,
      ifValue = "with-value",
      ifNoValue = "without-value",
   ) => (value === undefined || (Array.isArray(value) && value.length === 0) ? ifNoValue : ifValue);

   // Auto-collapse de la sidebar sur les écrans de petite taille
   useEffect(() => {
      setCollapsedSider(screens.lg !== undefined && !screens.lg);
   }, [screens]);

   return (
      <Layout.Sider width={300} className="calendar-sider" collapsed={collapsedSider}>
         <div className="collapse-trigger">
            {collapsedSider ? (
               <Button
                  className="shadow-1"
                  size="large"
                  icon={<RightOutlined />}
                  shape="circle"
                  onClick={() => setCollapsedSider(false)}
                  aria-label="Masquer la barre de navigation"
               />
            ) : (
               <Button
                  className="shadow-1"
                  size="large"
                  icon={<LeftOutlined />}
                  shape="circle"
                  onClick={() => setCollapsedSider(true)}
                  aria-label="Afficher la barre de navigation"
               />
            )}
         </div>
         <ul className="filters sider-content">
            <li className="li-calendar mb-2">
               <SmallCalendar />
            </li>
            {auth.user?.isPlanificateur && <FiltresFavorisEvenements />}
            {!saisieEvtRenfort && auth?.user?.isPlanificateur && (
               <li className="filter">
                  <span className="label">Statut</span>
                  <AffectationFilter
                     value={
                        (appAffichageFiltres.filtres[
                           "exists[intervenant]"
                        ] as AffectationFilterValues) || AffectationFilterValues.Tous
                     }
                     setValue={(value) => dispatch(setFiltres({ "exists[intervenant]": value }))}
                  />
                  <AnnulationFilter
                     value={
                        (appAffichageFiltres.filtres[
                           "exists[dateAnnulation]"
                        ] as AnnulationFilterValues) || AnnulationFilterValues.EnCours
                     }
                     setValue={(value) => dispatch(setFiltres({ "exists[dateAnnulation]": value }))}
                  />
               </li>
            )}

            {!saisieEvtRenfort && auth?.user?.isPlanificateur && (
               <li
                  className={`filter ${classNameByStatus(appAffichageFiltres.filtres["campus[]"])}`}
               >
                  <Space orientation="vertical" size="small" className="w-100">
                     <span className="label">Campus</span>
                     <CampusFilter
                        value={appAffichageFiltres.filtres["campus[]"]}
                        onChange={(value) => dispatch(setFiltres({ "campus[]": value }))}
                        mode="tags"
                     />
                  </Space>
               </li>
            )}

            {auth?.user?.isPlanificateur && (
               <li
                  className={`filter ${classNameByStatus(
                     appAffichageFiltres.filtres.intervenantBeneficiaire,
                  )}`}
               >
                  <Space orientation="vertical" size="small" className="w-100">
                     <span className="label">Bénéficiaire / Intervenant</span>
                     <BeneficiaireIntervenantFilter
                        value={
                           appAffichageFiltres.filtres.intervenantBeneficiaireRole
                              ? `${appAffichageFiltres.filtres.intervenantBeneficiaireRole}§${appAffichageFiltres.filtres.intervenantBeneficiaire}`
                              : undefined
                        }
                        onChange={(utilisateurId, role) => {
                           dispatch(
                              setFiltres({
                                 intervenantBeneficiaire: utilisateurId,
                                 intervenantBeneficiaireRole: role,
                              }),
                           );
                        }}
                        mode="multiple"
                     />
                  </Space>
               </li>
            )}

            {!saisieEvtRenfort && auth?.user?.isPlanificateur && (
               <li
                  className={`filter ${classNameByStatus(
                     appAffichageFiltres.filtres["utilisateurCreation[]"],
                  )}`}
               >
                  <Space orientation="vertical" size="small" className="w-100">
                     <span className="label">
                        Gestionnaire {env.REACT_APP_SERVICE}
                        <Tooltip title="Évènements que vous avez créés">
                           <Button
                              icon={<UserOutlined />}
                              className="float-right fs-09 text-light"
                              size="small"
                              type="text"
                              onClick={() => {
                                 dispatch(
                                    setFiltres({
                                       "utilisateurCreation[]": [auth.user?.["@id"] as string],
                                    }),
                                 );
                              }}
                           />
                        </Tooltip>
                     </span>
                     <GestionnaireFilter
                        value={appAffichageFiltres.filtres["utilisateurCreation[]"]}
                        setValue={(value) =>
                           dispatch(setFiltres({ "utilisateurCreation[]": value }))
                        }
                     />
                  </Space>
               </li>
            )}

            <li className={`filter ${classNameByStatus(appAffichageFiltres.filtres.type)}`}>
               <Space orientation="vertical" size="small" className="w-100">
                  <span className="label">
                     Catégories d'évènements
                     <Button
                        aria-label={`Sélectionner toutes les catégories d'évènements`}
                        className={`float-right fs-08 text-light contrast-no-border ${
                           appAffichageFiltres.filtres.type?.length ===
                           dataTypesEvenements?.items.filter((te) => te.actif).length
                              ? "d-none"
                              : ""
                        }`}
                        type="link"
                        size="small"
                        onClick={() =>
                           dispatch(
                              setFiltres({
                                 type: (dataTypesEvenements?.items || [])
                                    .filter((te) => te.actif)
                                    .map((te) => te["@id"] as string),
                              }),
                           )
                        }
                        icon={<Icon component={Asterisk} />}
                     />
                     <Button
                        aria-label={`Désélectionner toutes les catégories d'évènements`}
                        className={`float-right fs-08 text-light ${
                           appAffichageFiltres.filtres.type?.length !==
                           dataTypesEvenements?.items.filter((te) => te.actif).length
                              ? "d-none"
                              : ""
                        }`}
                        type="link"
                        size="small"
                        onClick={() =>
                           dispatch(
                              setFiltres({
                                 type: [],
                              }),
                           )
                        }
                        icon={<CloseCircleFilled className="mb-1" />}
                     />
                  </span>
                  <TypeEvenementFilter
                     setValue={(value) => dispatch(setFiltres({ type: value }))}
                     value={appAffichageFiltres.filtres.type}
                  />
               </Space>
            </li>
         </ul>
      </Layout.Sider>
   );
}
