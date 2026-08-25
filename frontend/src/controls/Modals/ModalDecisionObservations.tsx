/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 */

import { App, DatePicker, Form, Input, Modal } from "antd";
import React, { useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useApi } from "@context/api/ApiProvider";
import { QK_BENEFICIAIRES, QK_UTILISATEURS_DECISIONS, QK_UTILISATEURS_ITEM } from "@api";

type ObservationsForm = {
  observations: string | null;
  dateAvisMedecin: Dayjs | null;
};

interface ModalDecisionObservationsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  decisionId: string;
  utilisateurId: string;
}

/**
 * Permet à un gestionnaire de saisir / modifier les informations libres rattachées à
 * une décision d'aménagement d'examens :
 *  - le champ texte "Observations particulières"
 *  - la date de l'avis médical CDAPH (`dateAvisMedecin`), saisie au format DD/MM/YYYY
 *    et envoyée à l'API au format ISO `YYYY-MM-DD`.
 *
 * Les deux champs sont exposés via le DTO `DecisionAmenagementExamens` côté backend
 * (groupes `decision:in` et `decision:out`) et persistés respectivement en colonne
 * TEXT et DATE.
 */
export function ModalDecisionObservations({
  open,
  setOpen,
  decisionId,
  utilisateurId,
}: ModalDecisionObservationsProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<ObservationsForm>();

  const { data: decision, isFetching } = useApi().useGetItem({
    path: "/utilisateurs/{uid}/decisions/{annee}",
    url: decisionId,
    enabled: open && !!decisionId,
  });

  const mutateDecision = useApi().usePatch({
    path: "/utilisateurs/{uid}/decisions/{annee}",
    invalidationQueryKeys: [
      QK_BENEFICIAIRES,
      QK_UTILISATEURS_ITEM,
      QK_UTILISATEURS_DECISIONS,
      utilisateurId,
    ],
    onSuccess: () => {
      message.success("Observations enregistrées").then();
      setOpen(false);
    },
    onError: () => {
      message.error("Erreur lors de l'enregistrement des observations").then();
    },
  });

  useEffect(() => {
    if (open && decision) {
      form.setFieldsValue({
        observations: decision.observations ?? "",
        dateAvisMedecin: decision.dateAvisMedecin ? dayjs(decision.dateAvisMedecin) : null,
      });
    }
  }, [open, decision, form]);

  function handleSubmit(values: ObservationsForm) {
    const observations = values.observations?.trim() ? values.observations.trim() : null;
    const dateAvisMedecin = values.dateAvisMedecin
      ? values.dateAvisMedecin.format("YYYY-MM-DD")
      : null;
    mutateDecision.mutate({
      "@id": decisionId,
      data: { observations, dateAvisMedecin },
    });
  }

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      onOk={() => form.submit()}
      okText="Enregistrer"
      cancelText="Annuler"
      confirmLoading={mutateDecision.isPending}
      title="Observations particulières"
      width={640}
    >
      <Form<ObservationsForm>
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{ observations: "", dateAvisMedecin: null }}
      >
        <Form.Item
          name="observations"
          label="Observations particulières"
          extra="Texte libre. Sera repris sur la décision d'établissement transmise au bénéficiaire."
        >
          <Input.TextArea
            rows={4}
            maxLength={4000}
            showCount
            disabled={isFetching}
            placeholder="Saisir les observations particulières liées à cette décision..."
          />
        </Form.Item>
        <Form.Item
          name="dateAvisMedecin"
          label="Date de l'avis médical CDAPH"
          extra="Date à laquelle le médecin désigné par la CDAPH a rendu son avis. Format DD/MM/YYYY."
        >
          <DatePicker
            className="w-100"
            picker="date"
            format="DD/MM/YYYY"
            allowClear
            disabled={isFetching}
            placeholder="JJ/MM/AAAA"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
