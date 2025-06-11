/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { memo, ReactElement, useEffect } from "react";
import {
   Button,
   Card,
   Col,
   Dropdown,
   FloatButton,
   Row,
   Segmented,
   Space,
   Tooltip,
   Typography,
} from "antd";
import { affichageNbJours, calculateRange, rangeToLabel } from "../../../utils/dates";
import {
   ArrowLeftOutlined,
   ArrowRightOutlined,
   CalendarOutlined,
   CheckOutlined,
   MinusOutlined,
   MoreOutlined,
   PlusOutlined,
   TableOutlined,
} from "@ant-design/icons";
import moment from "moment/moment";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { setModalEvenement } from "../../../redux/actions/Modals";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../auth/AuthProvider";
import {
   DensiteValues,
   IAffichageFiltres,
   PlanningLayout,
   TypeAffichageValues,
} from "../../../redux/context/IAffichageFiltres";
import { IStore } from "../../../redux/Store";
import { setAffichage, setFiltres } from "../../../redux/actions/AffichageFiltre";
import ProgressAffectation from "../../Progress/ProgressAffectation";
import { Evenement } from "../../../lib/Evenement";
import "react-circular-progressbar/dist/styles.css";
import { ItemType } from "antd/es/menu/interface";
import RenfortInterventionAddImage from "../../Images/RenfortInterventionAddImage";
import { env } from "../../../env";

const MesInterventionsIntro = memo(
   (): ReactElement => (
      <>
         <Typography.Title level={2}>Mes interventions</Typography.Title>
         <Card className="mb-2 mt-2" variant={"borderless"}>
            <Row>
               <Col span={16}>
                  <Typography.Title level={3} className="mt-1">
                     Consultez et complétez vos interventions
                  </Typography.Title>
                  <Typography.Paragraph>
                     Vous pouvez voir ici les interventions que vous avez effectuées.
                     <br />
                     <br />
                     En tant que renfort {env.REACT_APP_SERVICE}, vous pouvez également saisir vos
                     interventions. Celles-ci devront être validées par un chargé d'accompagnement
                     pour pouvoir être envoyées à la RH pour paiement.
                  </Typography.Paragraph>
               </Col>
               <Col span={8} className="d-flex-center">
                  <RenfortInterventionAddImage style={{ width: "100%", maxHeight: 150 }} />
               </Col>
            </Row>
         </Card>
      </>
   ),
);

interface IToolbar {
   saisieEvtRenfort?: boolean;
   evenements: Evenement[];
}

/**
 * Renders the toolbar component for the calendar.
 * @param {Object} params - The parameters for the toolbar.
 * @param {Function} [params.saisieEvtRenfort] - The function to handle event reinforcement input.
 * @param {Evenement[]} params.evenements - The array of events.
 */
export default function Toolbar({ saisieEvtRenfort, evenements }: IToolbar) {
   const screens = useBreakpoint();
   const dispatch = useDispatch();
   const auth = useAuth();
   const appAffichageFiltres: IAffichageFiltres = useSelector(
      ({ affichageFiltres }: Partial<IStore>) => affichageFiltres,
   ) as IAffichageFiltres;
   const step = affichageNbJours(
      appAffichageFiltres.affichage.type,
      appAffichageFiltres.filtres.debut,
   );

   useEffect(() => {
      document
         .querySelectorAll(".ant-segmented-item-input")
         .forEach((el) => el.setAttribute("role", "option"));
   });

   function menuAffichageSmall() {
      function menuAffichageToggle(key: TypeAffichageValues, label: string) {
         return {
            key: key,
            label: label,
            className: appAffichageFiltres.affichage.type === key ? "active" : "",
            onClick: () =>
               dispatch(
                  setAffichage({
                     type: key,
                  }),
               ),
            icon: (
               <CheckOutlined
                  className={appAffichageFiltres.affichage.type === key ? "" : "v-hidden"}
               />
            ),
         };
      }

      if (screens.lg) return [];

      return [
         {
            key: "today",
            label: "Aujourd'hui",
            onClick: () => dispatch(setFiltres({ debut: new Date(), fin: new Date() })),
            icon: <CalendarOutlined />,
         },
         {
            key: "divider-2",
            type: "divider",
         },
         {
            key: "title-filtre",
            type: "group",
            label: "Période affichée",
         },
         menuAffichageToggle("month", "Mois"),
         menuAffichageToggle("week", "Semaine"),
         menuAffichageToggle("work_week", "5 jours"),
         menuAffichageToggle("day", "Jour"),
         {
            key: "divider-3",
            type: "divider",
         },
      ];
   }

   function menuAffichage(): ItemType[] {
      return [
         ...(menuAffichageSmall() as ItemType[]),
         {
            key: "title-densite",
            type: "group",
            label: "Densité d'affichage",
         },
         {
            key: "compact",
            label: "Compact",
            className:
               appAffichageFiltres.affichage.densite === DensiteValues.compact ? "active" : "",
            icon: (
               <CheckOutlined
                  className={
                     appAffichageFiltres.affichage.densite === DensiteValues.compact
                        ? ""
                        : "v-hidden"
                  }
               />
            ),
            onClick: () =>
               dispatch(
                  setAffichage({
                     densite: DensiteValues.compact,
                  }),
               ),
         },
         {
            key: "normal",
            label: "Normal",
            className:
               appAffichageFiltres.affichage.densite === DensiteValues.normal ? "active" : "",
            icon: (
               <CheckOutlined
                  className={
                     appAffichageFiltres.affichage.densite === DensiteValues.normal
                        ? ""
                        : "v-hidden"
                  }
               />
            ),
            onClick: () => dispatch(setAffichage({ densite: DensiteValues.normal })),
         },
         {
            key: "large",
            label: "Large",
            className:
               appAffichageFiltres.affichage.densite === DensiteValues.large ? "active" : "",
            icon: (
               <CheckOutlined
                  className={
                     appAffichageFiltres.affichage.densite === DensiteValues.large ? "" : "v-hidden"
                  }
               />
            ),
            onClick: () => dispatch(setAffichage({ densite: DensiteValues.large })),
         },
      ];
   }

   return (
      <>
         {saisieEvtRenfort && <MesInterventionsIntro />}
         <Row className="toolbar-container">
            <Col span={8}>
               <Space size={3}>
                  <Button
                     data-testid="toolbar-btn-prev"
                     size="large"
                     aria-label="Consulter la période précédente"
                     icon={<ArrowLeftOutlined />}
                     onClick={() =>
                        dispatch(
                           setFiltres({
                              debut: moment(appAffichageFiltres.filtres.debut)
                                 .subtract(step, "days")
                                 .toDate(),
                              fin: moment(appAffichageFiltres.filtres.fin)
                                 .subtract(step, "days")
                                 .toDate(),
                           }),
                        )
                     }
                  />
                  {screens.lg && (
                     <Tooltip title="Afficher aujourd'hui">
                        <Button
                           className="light"
                           size="large"
                           aria-label="Afficher aujourd'hui"
                           onClick={() => {
                              const range = calculateRange(
                                 new Date(),
                                 appAffichageFiltres.affichage.type,
                              );
                              dispatch(setFiltres({ debut: range.from, fin: range.to }));
                           }}
                        >
                           <CalendarOutlined />
                        </Button>
                     </Tooltip>
                  )}
                  <Button
                     data-testid="toolbar-btn-next"
                     size="large"
                     aria-label="Consulter la période suivante"
                     icon={<ArrowRightOutlined />}
                     className="mr-2"
                     onClick={() =>
                        dispatch(
                           setFiltres({
                              debut: moment(appAffichageFiltres.filtres.debut)
                                 .add(step, "days")
                                 .toDate(),
                              fin: moment(appAffichageFiltres.filtres.fin)
                                 .add(step, "days")
                                 .toDate(),
                           }),
                        )
                     }
                  />
                  {screens.md &&
                     rangeToLabel(
                        appAffichageFiltres.filtres.debut,
                        appAffichageFiltres.filtres.fin,
                     )}
               </Space>
            </Col>
            <Col span={16} className="text-right">
               <Space split={<MinusOutlined aria-hidden rotate={90} />}>
                  {!saisieEvtRenfort && auth.user?.isPlanificateur && (
                     <ProgressAffectation evenements={evenements} />
                  )}
                  <div>
                     <div className="sr-only">Mode d'affichage du planning</div>
                     <Segmented
                        value={appAffichageFiltres.affichage.layout}
                        onChange={(value) => {
                           dispatch(setAffichage({ layout: value as PlanningLayout }));
                        }}
                        options={[
                           {
                              value: PlanningLayout.calendar,
                              label: <CalendarOutlined aria-label="Vue calendrier" />,
                           },
                           {
                              value: PlanningLayout.table,
                              label: <TableOutlined aria-label="Vue tableau" />,
                           },
                        ]}
                     />
                  </div>
                  {screens.lg ? (
                     <div>
                        <div className="sr-only">Durée de la période affichée</div>
                        <Segmented
                           className="light"
                           options={[
                              { value: "day", label: "Jour" },
                              { value: "work_week", label: "5 jours" },
                              { value: "week", label: "Semaine" },
                              { value: "month", label: "Mois" },
                           ]}
                           value={appAffichageFiltres.affichage.type}
                           onChange={(value) =>
                              dispatch(
                                 setAffichage({
                                    type: value as TypeAffichageValues,
                                 }),
                              )
                           }
                        />
                     </div>
                  ) : null}
                  {appAffichageFiltres.affichage.layout === PlanningLayout.calendar ? (
                     <Dropdown
                        menu={{
                           items: menuAffichage(),
                        }}
                        trigger={["click"]}
                     >
                        <Button
                           type="text"
                           className="contrast-no-border mr-2"
                           size="large"
                           aria-label="Affichage"
                           icon={<MoreOutlined aria-hidden />}
                        />
                     </Dropdown>
                  ) : null}
               </Space>
            </Col>
         </Row>
         {auth?.user?.isPlanificateur && (
            <>
               <FloatButton
                  icon={<PlusOutlined />}
                  type="primary"
                  tooltip="Ajouter un évènement"
                  onClick={() => {
                     dispatch(
                        setModalEvenement(
                           saisieEvtRenfort ? { intervenant: auth.user?.["@id"] } : {},
                        ),
                     );
                  }}
               />
            </>
         )}
      </>
   );
}
