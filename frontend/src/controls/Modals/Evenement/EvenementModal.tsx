/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { App, Form, Modal } from "antd";
import { Evenement } from "@lib";
import { useAuth } from "@/auth/AuthProvider";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { canCreateEventOnDate, createDateAsUTC } from "@utils/dates";
import {
  IEvenement,
  IPartialEvenement,
  PREFETCH_LAST_PERIODES_RH,
  PREFETCH_TYPES_EVENEMENTS,
  QK_EVENEMENTS,
  QK_STATISTIQUES_EVENEMENTS,
} from "@api";
import { queryClient } from "@/queryClient";
import { useModals } from "@context/modals/ModalsContext";
import EvenementForm from "@controls/Modals/Evenement/EvenementForm";
import EvenementModalFooter from "@controls/Modals/Evenement/EvenementModalFooter";
import EvenementModalTitle from "@controls/Modals/Evenement/EvenementModalTitle";

interface IEvenementModal {
  id?: string;
  initialEvenement?: IEvenement | IPartialEvenement;
}

/**
 * Open a modal to display and edit information about an event.
 *
 * @param {Object} options - The options for the event modal.
 * @param {string} [options.id] - The ID of the event.
 * @param {Evenement} [options.initialEvenement] - The initial event object.
 *
 * @returns {ReactElement}
 */
export default function EvenementModal({ id, initialEvenement }: IEvenementModal): ReactElement {
  const { message } = App.useApp();
  const [evenementId, setEvenementId] = useState(id);
  const [evenement, setEvenement] = useState<Evenement | undefined>();
  const evenementRef = useRef<Evenement | undefined>(undefined);
  evenementRef.current = evenement;
  const [formIsDirty, setFormIsDirty] = useState(false);
  const { setModalEvenementId, setModalEvenement } = useModals();
  const [form] = Form.useForm<Evenement | undefined>();
  const auth = useAuth();

  // Dernière période dont la date butoir est dépassée
  const { data: lastPeriodes } = useApi().useGetCollection(PREFETCH_LAST_PERIODES_RH(auth.user));

  const resetSourceEvenement = useCallback(() => {
    setEvenement(undefined);
    form.resetFields();
  }, [form]);

  const handleClose = useCallback(() => {
    if (evenementId) queryClient.removeQueries({ queryKey: [evenementId] });
    setEvenementId(undefined);
    resetSourceEvenement();

    setModalEvenementId(undefined);
    setModalEvenement(undefined);
  }, [evenementId, resetSourceEvenement, setModalEvenement, setModalEvenementId]);

  const updateSourceEvenement = useCallback(
    (values: IPartialEvenement | undefined, forceResetForm = false) => {
      const evt = new Evenement({
        beneficiaires: [""],
        ...evenementRef.current,
        ...values,
      } as IEvenement);

      setEvenement(evt);
      if (forceResetForm) form.resetFields();
      form.setFieldsValue(evt);
    },
    [form],
  );

  // GET /evenements/{id}
  const { data: evenementData, isFetching: isFetchingEvenement } =
    useApi().useGetItem<"/evenements/{id}">({
      path: "/evenements/{id}",
      url: evenementId as string,
      enabled: !!evenementId,
    });

  useEffect(() => {
    if (evenementData) {
      updateSourceEvenement(evenementData);
    }
  }, [evenementData, updateSourceEvenement]);

  // Mutation d'un évènement
  const patchEvenement = useApi().usePatch({
    path: "/evenements/{id}",
    invalidationQueryKeys: [QK_EVENEMENTS, QK_STATISTIQUES_EVENEMENTS],
    onSuccess: () => {
      message.success("Évènement modifié").then();
      handleClose();
    },
  });

  const postEvenement = useApi().usePost({
    path: "/evenements",
    invalidationQueryKeys: [QK_EVENEMENTS, QK_STATISTIQUES_EVENEMENTS],
    onSuccess: () => {
      message.success("Évènement créé").then();
      handleClose();
    },
  });

  const { data: typesEvenements, isFetching: isFetchingType } =
    useApi().useGetFullCollection(PREFETCH_TYPES_EVENEMENTS);

  // -------- INITIALISATION --------

  // Initialisation via props : id
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvenementId(id);
  }, [id]);

  // Initialisation via props : initialEvenement
  useEffect(() => {
    if (initialEvenement) {
      updateSourceEvenement(initialEvenement, true);
    }
  }, [updateSourceEvenement, initialEvenement]);

  // -------- ACTIONS --------

  const handleDelete = () => {
    resetSourceEvenement();
    setEvenementId(undefined);
    handleClose();
  };

  const handleCreateOrUpdateEvenement = (values: Evenement | undefined) => {
    if (!values) return;

    // On met les dates au format ISO
    const data = {
      ...evenement,
      ...values,
      debut: createDateAsUTC(new Date(values.debut)).toISOString(),
      fin: createDateAsUTC(new Date(values.fin)).toISOString(),
      beneficiaires: values.beneficiaires?.filter((b) => b),
      intervenant: values.intervenant ? values.intervenant : null,
      tempsPreparation: Number(values.tempsPreparation || 0),
      tempsSupplementaire: Number(values.tempsSupplementaire || 0),
    };

    if (!data["@id"]) {
      // Nouvel évènement
      postEvenement.mutate({
        data,
      });
    } else {
      // Modification d'un évènement
      patchEvenement.mutate({
        "@id": evenement?.["@id"] as string,
        data,
      });
    }
  };

  // -------- RENDERING --------

  if (!evenement) return <Form form={form} className="d-none" />;

  if (isFetchingEvenement)
    return (
      <Form form={form} className="d-flex-center">
        <Spinner size={100} />
      </Form>
    );

  const isFormDisabled =
    !auth.user?.isPlanificateur ||
    evenement?.dateEnvoiRH !== undefined ||
    evenement?.dateValidation !== undefined ||
    (evenement?.debut !== undefined &&
      evenement?.debut !== "" &&
      !canCreateEventOnDate(new Date(evenement.debut), auth.user, lastPeriodes?.items[0]));

  return (
    <Modal
      key={evenement["@id"] || "evenenement-modal"}
      destroyOnHidden
      open
      centered
      width="66%"
      className="oasis-modal"
      onCancel={handleClose}
      onOk={handleClose}
      cancelButtonProps={{ style: { display: "none" } }}
      title={
        <EvenementModalTitle
          evenement={evenement}
          isFetchingType={isFetchingType}
          typesEvenements={typesEvenements}
        />
      }
      footer={
        <EvenementModalFooter
          evenement={evenement}
          form={form}
          onDelete={handleDelete}
          onCancel={handleClose}
        />
      }
    >
      <EvenementForm
        form={form}
        evenement={evenement}
        formIsDirty={formIsDirty}
        updateSourceEvenement={(values) => {
          setFormIsDirty(true);
          updateSourceEvenement(values);
        }}
        onFinish={(values) => {
          handleCreateOrUpdateEvenement(values);
          handleClose();
        }}
        disabled={isFormDisabled}
      />
    </Modal>
  );
}
