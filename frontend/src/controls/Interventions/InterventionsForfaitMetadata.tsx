/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Col, Row } from "antd";
import dayjs from "dayjs";
import { GestionnaireItem } from "@controls/Items/GestionnaireItem";
import { IInterventionForfait } from "@api";

interface InterventionsForfaitMetadataProps {
  editedItem: Partial<IInterventionForfait>;
}

export const InterventionsForfaitMetadata: React.FC<InterventionsForfaitMetadataProps> = ({
  editedItem,
}) => {
  if (!editedItem.dateCreation && !editedItem.dateModification) {
    return null;
  }

  return (
    <Row className="mb-3">
      <Col span={24} className="legende mt-1">
        {editedItem.dateCreation && (
          <>
            Créé le {dayjs(editedItem.dateCreation).format("DD/MM/YYYY")}
            {editedItem.utilisateurCreation && (
              <>
                {" "}
                par{" "}
                <GestionnaireItem
                  gestionnaireId={editedItem.utilisateurCreation}
                  showAvatar={false}
                />
              </>
            )}
          </>
        )}
        {editedItem.dateModification && (
          <>
            {editedItem.dateCreation && <br />}
            Dernière modification le {dayjs(editedItem.dateModification).format("DD/MM/YYYY")}
            {editedItem.utilisateurModification && (
              <>
                {" "}
                par{" "}
                <GestionnaireItem
                  gestionnaireId={editedItem.utilisateurModification}
                  showAvatar={false}
                />
              </>
            )}
          </>
        )}
      </Col>
    </Row>
  );
};
