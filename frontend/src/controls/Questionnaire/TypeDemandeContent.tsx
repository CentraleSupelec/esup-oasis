/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import { QuestionnaireEtape, useQuestionnaire } from "../../context/demande/QuestionnaireProvider";
import { App, Button, Card, Form, Layout, Skeleton, Steps, Typography } from "antd";
import { EtapeDemande } from "./EtapeDemande";
import "./TypeDemandeContent.scss";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { ExclamationCircleFilled } from "@ant-design/icons";

/**
 * @function TypeDemandeContent
 * @returns {React.ReactElement} The Steps component with the current step from the typeDemande context.
 */
export function TypeDemandeContent(): React.ReactElement {
   const { notification } = App.useApp();
   // Use the typeDemande context
   const { questionnaire, form, questUtils, submitting, blocage } = useQuestionnaire();
   const [etapeCourante, setEtapeCourante] = useState<number>(0);
   const screens = useBreakpoint();
   const [changementEtape, setChangementEtape] = React.useState<string>();
   const [initialisation, setInitialisation] = React.useState<boolean>(false);

   useEffect(() => {
      if (!initialisation && questionnaire) {
         form?.setFieldsValue(questUtils?.getFormInitialValues() || {});
         setInitialisation(true);
      }
   }, [initialisation, form, questUtils, questionnaire]);

   if (!questionnaire) return <Skeleton paragraph={{ rows: 6 }} active />;

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   function scrollToError(error: any) {
      let field = null;
      if (error.errorFields && error.errorFields[0]) {
         const fieldName = error.errorFields[0]?.name?.[0];
         field = document.querySelector(`label[for="${fieldName}"]`) as HTMLElement;
      }

      notification.error({
         title: "Erreur lors de la soumission du formulaire",
         description: (
            <>
               Veuillez corriger les erreurs du formulaire{" "}
               {field && <span>au niveau du champ : "{field ? field.innerText : ""}"</span>}
            </>
         ),
         icon: <ExclamationCircleFilled className="text-danger" aria-hidden={true} />,
      });

      if (field) {
         const y = field.getBoundingClientRect().top + window.scrollY - 100;
         window.scrollTo({ top: y, behavior: "smooth" });
      }
   }

   function etapeSuivante() {
      setChangementEtape("next");

      form
         ?.validateFields({ validateOnly: false })
         .then(() => {
            setEtapeCourante((prevCurrentEtape: number) => prevCurrentEtape + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
            document.getElementById("etape-title")?.focus();
            setChangementEtape(undefined);
         })
         .catch((e) => {
            scrollToError(e);
            setChangementEtape(undefined);
         });
   }

   function etapePrecedente() {
      setChangementEtape("previous");

      form
         ?.validateFields({ validateOnly: false })
         .then(() => {
            setEtapeCourante((prevCurrentEtape: number) => prevCurrentEtape - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
            document.getElementById("etape-title")?.focus();
            setChangementEtape(undefined);
         })
         .catch((e) => {
            scrollToError(e);
            setChangementEtape(undefined);
         });
   }

   const avancementAccessibilite = `Avancement dans le remplissage du questionnaire : le questionnaire contient ${questionnaire.etapes.length} étapes. Vous êtes actuellement ${etapeCourante === questionnaire.etapes.length ? "à la dernière étape de validation." : `à l'étape ${etapeCourante + 1} nommée "${questionnaire.etapes[etapeCourante].libelle}".`}`;

   // Return the Steps component
   return (
      <Layout.Content>
         <Typography.Title level={2}>
            Questionnaire &laquo; {questionnaire.libelle} &raquo;
         </Typography.Title>
         <Card
            actions={[
               etapeCourante > 0 ? (
                  <Button
                     loading={changementEtape === "previous"}
                     aria-label="Retourner à l'étape précédente du questionnaire"
                     style={{ margin: "0 8px" }}
                     onClick={() => etapePrecedente()}
                     disabled={changementEtape !== undefined || submitting}
                  >
                     Précédent
                  </Button>
               ) : (
                  <span />
               ),
               etapeCourante < (questionnaire.etapes || []).length - 1 ? (
                  <Button
                     loading={changementEtape === "next"}
                     aria-label="Passer à l'étape suivante du questionnaire"
                     type="primary"
                     onClick={() => etapeSuivante()}
                     disabled={changementEtape !== undefined || submitting || blocage}
                  >
                     Suivant
                  </Button>
               ) : (
                  <span />
               ),
            ].filter((action) => action !== null)}
         >
            <Form id="form-demande" className="type-demande" form={form} layout="vertical">
               <div className="sr-only">{avancementAccessibilite}</div>
               <Steps
                  aria-hidden={true}
                  current={etapeCourante}
                  items={[
                     ...(questionnaire.etapes || []).map((etape: QuestionnaireEtape, index) => ({
                        key: etape["@id"],
                        id: etape["@id"],
                        title: (
                           <>
                              {etapeCourante === index ? (
                                 <span className="sr-only">Étape actuelle : </span>
                              ) : (
                                 ""
                              )}
                              {etape.libelle}
                           </>
                        ),
                     })),
                  ]}
                  responsive
                  titlePlacement={
                     screens.lg && questionnaire.etapes.length < 5 ? "horizontal" : "vertical"
                  }
               />
               <EtapeDemande etapeIndex={etapeCourante} />
            </Form>
         </Card>
      </Layout.Content>
   );
}
