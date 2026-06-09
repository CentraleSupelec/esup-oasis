/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect } from "react";
import {
  useQuestionnaire,
  useQuestionnaireNavigation,
} from "@context/demande/QuestionnaireProvider";
import { App, Button, Card, Form, Layout, Skeleton, Steps, Typography } from "antd";
import { EtapeDemande } from "@controls/Questionnaire/EtapeDemande";
import "@controls/Questionnaire/TypeDemandeContent.scss";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { ExclamationCircleFilled } from "@ant-design/icons";

export function TypeDemandeContent(): React.ReactElement {
  const { notification } = App.useApp();
  const { questionnaire, form, questUtils, submitting, blocage } = useQuestionnaire();
  const screens = useBreakpoint();
  const initialisation = React.useRef<boolean>(false);

  function scrollToError(error: unknown) {
    let field = null;
    const formError = error as { errorFields?: Array<{ name?: string[] }> };
    if (formError.errorFields?.[0]) {
      const fieldName = formError.errorFields[0]?.name?.[0];
      field = document.querySelector(`label[for="${fieldName}"]`) as HTMLElement;
    }

    notification.error({
      message: "Erreur lors de la soumission du formulaire",
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

  const { etapeCourante, changementEtape, etapeSuivante, etapePrecedente } =
    useQuestionnaireNavigation({
      questionnaire,
      form,
      onError: scrollToError,
    });

  useEffect(() => {
    if (!initialisation.current && questionnaire) {
      form?.setFieldsValue(questUtils?.getFormInitialValues() || {});
      initialisation.current = true;
    }
  }, [form, questUtils, questionnaire]);

  if (!questionnaire) return <Skeleton paragraph={{ rows: 6 }} active />;

  const avancementAccessibilite = `Avancement dans le remplissage du questionnaire : le questionnaire contient ${
    questionnaire.etapes.length
  } étapes. Vous êtes actuellement à l'étape ${etapeCourante + 1} nommée "${questionnaire.etapes[etapeCourante].libelle}".`;

  return (
    <Layout.Content>
      <Typography.Title level={2}>
        Questionnaire &laquo; {questionnaire.libelle} &raquo;
      </Typography.Title>
      <Card
        actions={[
          etapeCourante > 0 ? (
            <Button
              key="prev"
              loading={changementEtape === "previous"}
              aria-label="Retourner à l'étape précédente du questionnaire"
              style={{ margin: "0 8px" }}
              onClick={() => etapePrecedente()}
              disabled={changementEtape !== undefined || submitting}
            >
              Précédent
            </Button>
          ) : (
            <span key="prev-empty" />
          ),
          etapeCourante < (questionnaire.etapes || []).length - 1 ? (
            <Button
              key="next"
              loading={changementEtape === "next"}
              aria-label="Passer à l'étape suivante du questionnaire"
              type="primary"
              onClick={() => etapeSuivante()}
              disabled={changementEtape !== undefined || submitting || blocage}
            >
              Suivant
            </Button>
          ) : (
            <span key="next-empty" />
          ),
        ].filter((action) => action !== null)}
      >
        <Form id="form-demande" className="type-demande" form={form} layout="vertical">
          <div className="sr-only">{avancementAccessibilite}</div>
          <Steps
            aria-hidden={true}
            current={etapeCourante}
            items={[
              ...(questionnaire.etapes || []).map((etape, index) => ({
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
