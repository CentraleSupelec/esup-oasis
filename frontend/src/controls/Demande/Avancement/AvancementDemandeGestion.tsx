/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { App, Button, Space, Steps, Typography } from "antd";
import {
   ETAT_ATTENTE_ACCOMPAGNEMENT,
   ETAT_ATTENTE_CHARTES,
   ETAT_DEMANDE_ATTENTE_COMMISSION,
   ETAT_DEMANDE_CONFORME,
   ETAT_DEMANDE_EN_COURS,
   ETAT_DEMANDE_NON_CONFORME,
   ETAT_DEMANDE_RECEPTIONNEE,
   ETAT_DEMANDE_REFUSEE,
   ETAT_DEMANDE_VALIDEE,
   EtatInfo,
   getEtatDemandeInfo,
} from "../../../lib/demande";
import "./AvancementDemande.scss";
import { ICampagneDemande, IDemande, ITypeDemande } from "../../../api/ApiTypeHelpers";
import { useApi } from "../../../context/api/ApiProvider";
import { queryClient } from "../../../App";
import ConformiteSelectButton from "./ConformiteSelectButton";
import ProfilsSelectButton from "./ProfilsSelectButton";
import ValidationAccompagnementButton from "../ValidationAccompagnementButton";
import { DemandeProfilAttribue } from "./AvancementDemande";
import { useNavigate } from "react-router-dom";
import { FONCTIONNALITES, useQuestionnaire } from "../../../context/demande/QuestionnaireProvider";
import { DerniereModifDemandeLabel } from "../../Avatars/DerniereModifDemandeLabel";
import { RefsTourDemande } from "../../../routes/gestionnaire/demandeurs/Demande";
import { useAuth } from "../../../auth/AuthProvider";

function EtapeADescription(props: { etatDemande: EtatInfo; demande: IDemande }) {
   const { message } = App.useApp();
   const mutation = useApi().usePatch({
      path: props.demande["@id"] as "/demandes/{id}",
      invalidationQueryKeys: ["/demandes"],
      onSuccess: () => {
         queryClient
            .invalidateQueries({ queryKey: ["/demandes", props.demande["@id"]] })
            .then(() => {
               message.success("Demande déclarée réceptionnée").then();
            });
      },
   });

   const { questUtils } = useQuestionnaire();
   if (props.etatDemande.ordre === getEtatDemandeInfo(ETAT_DEMANDE_EN_COURS)?.ordre)
      return (
         <>
            <Typography.Text type="secondary">La demande est en cours de saisie</Typography.Text>
            {questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.DECLARER_RECEPTIONNEE) && (
               <Button
                  size="small"
                  className="mt-1"
                  onClick={() => {
                     mutation.mutate({
                        "@id": props.demande["@id"] as string,
                        data: {
                           etat: ETAT_DEMANDE_RECEPTIONNEE,
                        },
                     });
                  }}
               >
                  Déclarer réceptionnée
               </Button>
            )}
         </>
      );

   return <Typography.Text>Demande réceptionnée</Typography.Text>;
}

function EtapeBDescription(props: { etatDemande: EtatInfo; demande: IDemande }) {
   const { message } = App.useApp();
   const { user } = useAuth();
   const { questUtils } = useQuestionnaire();
   const { data: membreCommission } = useApi().useGetItem({
      path: "/commissions/{commissionId}/membres/{uid}",
      url: `/commissions/${props.demande.idCommission}/membres/${user?.uid}`,
      enabled:
         props.demande.idCommission !== undefined &&
         user?.uid !== undefined &&
         user.isCommissionMembre,
   });

   const mutation = useApi().usePatch({
      path: props.demande["@id"] as "/demandes/{id}",
      invalidationQueryKeys: ["/demandes"],
      onSuccess: () => {
         queryClient
            .invalidateQueries({ queryKey: ["/demandes", props.demande["@id"]] })
            .then(() => {
               message.success("Demande déclarée réceptionnée").then();
            });
      },
   });

   if (props.etatDemande.id === ETAT_DEMANDE_RECEPTIONNEE)
      return (
         <>
            {questUtils?.isGrantedQuestionnaire(
               FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE,
               membreCommission?.roles,
            ) && <ConformiteSelectButton demande={props.demande} />}
         </>
      );

   if (props.etatDemande.etape < "B") return <></>;

   if (props.etatDemande.ordre === getEtatDemandeInfo(ETAT_DEMANDE_NON_CONFORME)?.ordre) {
      return (
         <>
            <Typography.Text type="danger">Demande non conforme</Typography.Text>
            {questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE) && (
               <Button
                  size="small"
                  className="mt-1"
                  onClick={() => {
                     mutation.mutate({
                        "@id": props.demande["@id"] as string,
                        data: {
                           etat: ETAT_DEMANDE_RECEPTIONNEE,
                        },
                     });
                  }}
               >
                  Annuler
               </Button>
            )}
         </>
      );
   }

   return <Typography.Text>Demande conforme</Typography.Text>;
}

// Choix du profil
function EtapeCDescription(props: { demande: IDemande; etatDemande: EtatInfo }) {
   const { questUtils } = useQuestionnaire();
   const { user } = useAuth();
   const { data: membreCommission } = useApi().useGetItem({
      path: "/commissions/{commissionId}/membres/{uid}",
      url: `/commissions/${props.demande.idCommission}/membres/${user?.uid}`,
      enabled:
         props.demande.idCommission !== undefined &&
         user?.uid !== undefined &&
         user.isCommissionMembre,
   });

   if (props.etatDemande.id === ETAT_DEMANDE_CONFORME) {
      if (
         !questUtils?.isGrantedQuestionnaire(
            FONCTIONNALITES.ATTRIBUER_PROFIL,
            membreCommission?.roles,
         )
      ) {
         return <>En attente profil</>;
      }

      return (
         <>
            {questUtils?.isGrantedQuestionnaire(
               FONCTIONNALITES.ATTRIBUER_PROFIL,
               membreCommission?.roles,
            ) && <ProfilsSelectButton demande={props.demande} masquerCommission={false} />}
         </>
      );
   }

   if (props.etatDemande.etape < "C") return <></>;

   if (props.etatDemande.id === ETAT_DEMANDE_REFUSEE) {
      return <Typography.Text type="danger">Demande refusée</Typography.Text>;
   }

   if (props.etatDemande.id === ETAT_DEMANDE_ATTENTE_COMMISSION) {
      return (
         <>
            <Typography.Text type="warning">Attente commission</Typography.Text>{" "}
            <>
               {questUtils?.isGrantedQuestionnaire(
                  FONCTIONNALITES.ATTRIBUER_PROFIL,
                  membreCommission?.roles,
               ) && <ProfilsSelectButton demande={props.demande} masquerCommission={true} />}
            </>
         </>
      );
   }

   return (
      <>
         <Typography.Text>Profil attribué</Typography.Text>
         <DemandeProfilAttribue demandeId={props.demande["@id"] as string} />
      </>
   );
}

function EtapeDDescription(props: {
   demande: IDemande;
   etatDemande: EtatInfo;
   typeDemande: ITypeDemande;
   campagne: ICampagneDemande;
}) {
   const navigate = useNavigate();
   const { questUtils } = useQuestionnaire();
   const { data: beneficiaire } = useApi().useGetItem({
      path: "/utilisateurs/{uid}",
      url: props.demande.demandeur?.["@id"] as string,
      enabled: props.demande.demandeur !== undefined,
   });

   if (props.etatDemande.etape < "D" || props.etatDemande.id === ETAT_ATTENTE_CHARTES) return <></>;

   if (props.etatDemande.id === ETAT_DEMANDE_REFUSEE) {
      return <Typography.Text type="danger">Accompagnement refusé</Typography.Text>;
   }

   if (props.etatDemande.id === ETAT_DEMANDE_VALIDEE) {
      return (
         <Space direction="vertical">
            <Typography.Text type="success">Accompagnement validé</Typography.Text>
            {beneficiaire && beneficiaire.roles?.includes("ROLE_BENEFICIAIRE") && (
               <Button
                  size="small"
                  onClick={() => {
                     navigate(
                        (props.demande.demandeur?.["@id"] as string).replace(
                           "/utilisateurs/",
                           "/beneficiaires/",
                        ),
                     );
                  }}
               >
                  Voir bénéficiaire
               </Button>
            )}
         </Space>
      );
   }

   return (
      <Space direction="vertical">
         Accompagnement à valider
         {questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.STATUER_ACCOMPAGNEMENT) && (
            <ValidationAccompagnementButton demande={props.demande} />
         )}
      </Space>
   );
}

export default function AvancementDemandeGestion(props: {
   refs?: RefsTourDemande;
}): React.ReactElement {
   const { demande, etatDemande, typeDemande, campagne } = useQuestionnaire();

   if (!demande) return <>Demande inconnue</>;
   if (!etatDemande) return <>Etat de la demande inconnue</>;

   function calculerEtatStep(etape: string) {
      if (!etatDemande || !demande) return "wait";

      switch (etape) {
         case "A":
            if (etatDemande.etape > "A" || demande.etat === ETAT_DEMANDE_RECEPTIONNEE)
               return "finish";
            return "process";

         case "B":
            if (etatDemande.etape > "B" || demande.etat === ETAT_DEMANDE_CONFORME) return "finish";
            if (demande.etat === ETAT_DEMANDE_RECEPTIONNEE) return "process";
            return "wait";

         case "D":
            if (demande.etat === ETAT_DEMANDE_VALIDEE || demande.etat === ETAT_DEMANDE_REFUSEE)
               return "finish";
            if (demande.etat === ETAT_ATTENTE_ACCOMPAGNEMENT) return "process";
            return "wait";
      }
   }

   return (
      <div ref={props.refs?.avancement}>
         <Steps className="stepper-gestionnaire">
            <Steps.Step
               key="A"
               title="Saisie"
               status={calculerEtatStep("A")}
               description={<EtapeADescription etatDemande={etatDemande} demande={demande} />}
            />
            <Steps.Step
               key="B"
               title="Conformité"
               status={calculerEtatStep("B")}
               description={<EtapeBDescription demande={demande} etatDemande={etatDemande} />}
            />
            {((typeDemande?.profilsCibles || []).length > 1 || campagne?.commission) && (
               <Steps.Step
                  title="Profil"
                  status={etatDemande.etape >= "C" ? "finish" : "wait"}
                  description={<EtapeCDescription demande={demande} etatDemande={etatDemande} />}
               />
            )}
            {demande.etat === ETAT_ATTENTE_CHARTES && (
               <Steps.Step
                  title="Charte(s)"
                  status="process"
                  description={<>Attente validation charte(s)</>}
               />
            )}
            <Steps.Step
               title="Accompagnement"
               status={calculerEtatStep("D")}
               description={
                  <EtapeDDescription
                     demande={demande}
                     etatDemande={etatDemande}
                     typeDemande={typeDemande as ITypeDemande}
                     campagne={campagne as ICampagneDemande}
                  />
               }
            />
         </Steps>
         {(etatDemande.id === ETAT_DEMANDE_NON_CONFORME ||
            etatDemande.id === ETAT_DEMANDE_ATTENTE_COMMISSION) && (
            <DerniereModifDemandeLabel
               asAlert
               demandeId={demande?.["@id"]}
               classNameValue="semi-bold"
               title=""
               ifEmpty={<Typography.Text type="secondary">Aucun complément</Typography.Text>}
            />
         )}
      </div>
   );
}
