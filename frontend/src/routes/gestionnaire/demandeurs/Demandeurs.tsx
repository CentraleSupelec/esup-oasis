/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import { Button, Flex, FloatButton, Layout, Typography } from "antd";
import DemandeTable from "../../../controls/Table/DemandeTable";
import { PlusOutlined, QuestionCircleFilled } from "@ant-design/icons";
import NouvelleDemandeModaleGestionnaire from "../../../controls/Modals/Demande/NouvelleDemandeModaleGestionnaire";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { DemandeursTour } from "../../../controls/Demande/Tour/DemandeursTour";
import { env } from "../../../env";

export type RefsTourDemandes = {
   table: React.RefObject<HTMLDivElement | null>;
   filtres: React.RefObject<HTMLDivElement | null>;
   filtresDetails: React.RefObject<HTMLDivElement | null>;
   favoris: React.RefObject<HTMLDivElement | null>;
};

/**
 * Renders the page for ROLE_GESTIONNAIRE to manage beneficiaries.
 *
 * @returns {ReactElement} The rendered Beneficiaires component.
 */
export default function Demandeurs(): ReactElement {
   const screens = useBreakpoint();
   const [nouvelleDemande, setNouvelleDemande] = useState<boolean>(false);
   const [afficherTour, setAfficherTour] = React.useState<boolean>(false);
   const refs = {
      table: React.useRef<HTMLDivElement>(null),
      filtres: React.useRef<HTMLDivElement>(null),
      filtresDetails: React.useRef<HTMLDivElement>(null),
      favoris: React.useRef<HTMLDivElement>(null),
   };

   return (
      <Layout.Content className="demandes" style={{ padding: "0 50px" }}>
         {afficherTour && (
            <DemandeursTour open={afficherTour} setOpen={setAfficherTour} refs={refs} />
         )}
         <Flex justify="space-between" align="center">
            <Typography.Title level={1}>Demandes</Typography.Title>
            {env.REACT_APP_VISITE_GUIDEE !== "false" && screens.lg && (
               <Button
                  icon={<QuestionCircleFilled />}
                  className="mb-0 border-primary text-primary"
                  onClick={() => setAfficherTour(true)}
               >
                  Visite guidée
               </Button>
            )}
         </Flex>
         <DemandeTable refs={refs} affichageTour={afficherTour} />
         <NouvelleDemandeModaleGestionnaire open={nouvelleDemande} setOpen={setNouvelleDemande} />
         <FloatButton
            icon={<PlusOutlined />}
            type="primary"
            tooltip="Ajouter une demande"
            onClick={() => setNouvelleDemande(true)}
         />
      </Layout.Content>
   );
}
