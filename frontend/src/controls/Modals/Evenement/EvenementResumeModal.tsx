/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useState } from "react";
import { Col, Modal, Row, Skeleton } from "antd";
import { useModals } from "@context/modals/ModalsContext";
import { Evenement } from "@lib";
import { useApi } from "@context/api/ApiProvider";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { EvenementResumeInformations } from "@controls/Modals/Evenement/EvenementResume/EvenementResumeInformations";
import { EvenementResumeAutresInformations } from "@controls/Modals/Evenement/EvenementResume/EvenementResumeAutresInformations";
import { EvenementResumeParticipants } from "@controls/Modals/Evenement/EvenementResume/EvenementResumeParticipants";
import { useAuth } from "@/auth/AuthProvider";
import EtudiantClassroomImage from "@controls/Images/EtudiantClassroomImage";

interface EvenementResumeModalProps {
  id?: string;
}

/**
 * Renders a modal containing summary details of an event.
 * @param {Object} param - The parameter object.
 * @param {string} [param.id] - The identifier of the event.
 * @returns {ReactElement} - The rendered modal component.
 */
export default function EvenementResumeModal({ id }: EvenementResumeModalProps): ReactElement {
  const screens = useBreakpoint();
  const [evenementId, setEvenementId] = React.useState<string | undefined>(id);
  const [evenement, setEvenement] = useState<Evenement | undefined>();
  const user = useAuth().user;

  const { setModalEvenementId, setModalEvenement } = useModals();

  // GET /evenements/{id}
  const { data, isFetching: isFetchingEvenement } = useApi().useGetItem<"/evenements/{id}">({
    path: "/evenements/{id}",
    url: evenementId as string,
    enabled: !!evenementId,
  });

  // -------- INITIALISATION --------

  // Initialisation via props : id
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvenementId(id);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvenement(new Evenement(data));
  }, [data]);

  function handleClose() {
    setEvenement(() => {
      setEvenementId(undefined);
      setModalEvenementId(undefined);
      setModalEvenement(undefined);
      return undefined;
    });
  }

  if (isFetchingEvenement) {
    // Skeleton
    return (
      <Modal
        centered
        open
        onCancel={handleClose}
        width="80%"
        title="Détails de l'évènement"
        cancelButtonProps={{
          style: { display: "none" },
        }}
        okText="Fermer"
      >
        <Skeleton active />
      </Modal>
    );
  }

  return (
    <Modal
      centered
      open
      onCancel={handleClose}
      onOk={handleClose}
      className="oasis-modal oasis-modal-overflow"
      width="80%"
      title={<span className="fs-12">Détails de l'évènement</span>}
      style={{ maxWidth: 1100 }}
      cancelButtonProps={{
        style: { display: "none" },
      }}
      okText="Fermer"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <EvenementResumeInformations evenement={evenement} />
          <EvenementResumeAutresInformations evenement={evenement} />
          {user?.isIntervenant && (
            <div className="legende mt-2 line-height-12">
              <sup>*</sup> : Attention, les informations concernant le montant sont données à titre
              indicatif et peuvent être ajustées par le service RH de l'établissement.
            </div>
          )}
        </Col>
        <Col xs={24} lg={12}>
          <EvenementResumeParticipants evenement={evenement} />
          {screens.lg && (
            <div className="w-100 mt-4 d-flex-center">
              <EtudiantClassroomImage style={{ width: "90%" }} />
            </div>
          )}
        </Col>
      </Row>
    </Modal>
  );
}
