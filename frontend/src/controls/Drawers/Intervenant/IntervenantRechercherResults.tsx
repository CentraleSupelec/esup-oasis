/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useState } from "react";
import { Avatar, Button, Empty, List } from "antd";
import { InfoCircleOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import ListSelectable from "@controls/Forms/ListSelectable/ListSelectable";
import UtilisateurDrawer from "@controls/Drawers/Utilisateur/UtilisateurDrawer";
import { components } from "@api/schema";

interface IntervenantRechercherResultsProps {
  intervenantsProposes: { items: components["schemas"]["Utilisateur.jsonld-utilisateur.out"][] };
  selectedIntervenant?: string;
  setSelectedIntervenant: (id?: string) => void;
  onBack: () => void;
  onAffecter: () => void;
  btnLabel: string;
}

const IntervenantRechercherResults: React.FC<IntervenantRechercherResultsProps> = ({
  intervenantsProposes,
  selectedIntervenant,
  setSelectedIntervenant,
  onBack,
  onAffecter,
  btnLabel,
}) => {
  const [selectedIntervenantDetails, setSelectedIntervenantDetails] = useState<string>();

  return (
    <div className="mt-3">
      {selectedIntervenantDetails && (
        <UtilisateurDrawer
          id={selectedIntervenantDetails}
          onClose={() => setSelectedIntervenantDetails(undefined)}
        />
      )}
      <h3>Intervenants proposés</h3>
      {intervenantsProposes.items.length > 0 ? (
        <>
          <ListSelectable
            items={intervenantsProposes.items}
            selectedItemId={selectedIntervenant}
            classNameSelected="bg-intervenant-light"
            onSelect={(item) => {
              setSelectedIntervenant(item ? item["@id"] : undefined);
            }}
            extra={(item) => {
              return (
                <Button
                  onClick={() => setSelectedIntervenantDetails(item["@id"])}
                  type="text"
                  icon={<InfoCircleOutlined style={{ fontSize: "1.5rem" }} />}
                />
              );
            }}
            renderItem={(item) => (
              <List.Item.Meta
                className="meta"
                avatar={<Avatar icon={<UserOutlined />} />}
                title={`${item.prenom} ${item.nom?.toLocaleUpperCase()}`}
                description={item.email || "Pas d'email"}
              />
            )}
          />
          <div className="text-center mt-3">
            <Button onClick={onBack} size="large" className="mr-2">
              Retour
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              onClick={onAffecter}
              disabled={!selectedIntervenant}
            >
              {btnLabel}
            </Button>
          </div>
        </>
      ) : (
        <>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Aucun intervenant ne correspond aux critères"
          />
          <div className="text-center mt-3">
            <Button onClick={onBack} size="large">
              Retour
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default IntervenantRechercherResults;
