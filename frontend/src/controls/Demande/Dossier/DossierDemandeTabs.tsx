/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { IDemande, ITypeDemande } from "@api";
import { Button, Form, FormInstance, Tabs, TabsProps } from "antd";
import { RefsTourDemande } from "@routes/gestionnaire/demandeurs/Demande";
import React from "react";
import { FONCTIONNALITES, useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import { TabIdentite } from "@controls/TabsContent/TabIdentite";
import {
  CloseOutlined,
  EditOutlined,
  FileOutlined,
  FileTextOutlined,
  HistoryOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getEtatDemandeInfo } from "@lib";
import { EtapeDemande } from "@controls/Questionnaire/EtapeDemande";
import { DossierDemandeTabPiecesJustificatives } from "@controls/Demande/Dossier/DossierDemandeTabPiecesJustificatives";
import { DossierDemandeTabHistorique } from "@controls/Demande/Dossier/DossierDemandeTabHistorique";

export function DossierDemandeTabs(props: {
  demande: IDemande;
  typeDemande: ITypeDemande;
  form?: FormInstance<ITypeDemande>;
  refs?: RefsTourDemande;
}): React.ReactElement {
  const { questUtils, mode, setMode } = useQuestionnaire();
  const tabsItems: TabsProps["items"] = [
    {
      key: "identite",
      label: "Identité",
      children: (
        <TabIdentite
          utilisateurId={props.demande.demandeur?.["@id"] as string}
          demandeId={props.demande["@id"]}
        />
      ),
      icon: <UserOutlined />,
    },
    ...(props.typeDemande?.etapes || [])
      // on retire la 1ère étape d'intro + la dernière étape qui est la page de confirmation
      .slice(1, (props.typeDemande?.etapes || []).length - 1)
      .map((e, index) => ({
        key: e["@id"] as string,
        label: e.libelle,
        icon: <FileOutlined />,
        children: (
          <Form<ITypeDemande>
            className="type-demande"
            form={props.form}
            layout="vertical"
            initialValues={questUtils?.getFormInitialValues()}
            disabled={mode === "preview"}
          >
            {questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.DECLARER_RECEPTIONNEE) &&
              getEtatDemandeInfo(props.demande.etat as string)?.gestionnairePeutModifier && (
                <Button
                  type={mode === "saisie" ? undefined : "primary"}
                  icon={mode === "saisie" ? <CloseOutlined /> : <EditOutlined />}
                  className="float-right"
                  disabled={false}
                  onClick={() => setMode(mode === "saisie" ? "preview" : "saisie")}
                >
                  {mode === "saisie" ? "Quitter l'édition" : "Éditer le questionnaire"}
                </Button>
              )}
            {/* +1 pour le décallage dû au retrait de l'étape initiale */}
            <EtapeDemande etapeIndex={index + 1} />
          </Form>
        ),
      })),
    {
      key: "pj",
      label: "Pièces justificatives",
      children: <DossierDemandeTabPiecesJustificatives />,
      icon: <FileTextOutlined />,
    },
    {
      key: "historique",
      label: "Historique des actions",
      children: <DossierDemandeTabHistorique />,
      icon: <HistoryOutlined />,
    },
  ];

  return (
    <div ref={props.refs?.dossier}>
      <Tabs
        className="mb-2 pl-2 pr-2"
        defaultActiveKey="1"
        items={tabsItems}
        onChange={() => setMode("preview")}
      />
    </div>
  );
}
