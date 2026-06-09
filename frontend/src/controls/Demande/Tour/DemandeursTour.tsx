/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect } from "react";
import { Button, Space, Tour, TourProps } from "antd";
import { EtatDemandeAvatar } from "@controls/Avatars/EtatDemandeAvatar";
import { ETAT_DEMANDE_ATTENTE_COMMISSION, ETAT_DEMANDE_CONFORME, ETAT_DEMANDE_VALIDEE } from "@lib";
import { EyeOutlined } from "@ant-design/icons";
import { RefsTourDemandes } from "@routes/gestionnaire/demandeurs/Demandeurs";

export function DemandeursTour(props: {
  setOpen: (open: boolean) => void;
  open: boolean;
  refs: RefsTourDemandes;
}) {
  const [openState, setOpenState] = React.useState<boolean>(props.open);
  const [currentStep, setCurrentStep] = React.useState<number>(0);

  // Sync state during render
  if (!props.open && openState) {
    setOpenState(false);
  }

  useEffect(() => {
    if (currentStep === 1) {
      window.scrollTo({ top: 0 });
    }
  }, [currentStep]);

  useEffect(() => {
    if (props.open) {
      // on laisse le temps à la page de se charger
      const timer = window.setTimeout(() => {
        setOpenState(true);
      }, 750);
      return () => window.clearTimeout(timer);
    }
    return () => {};
  }, [props.open]);

  const steps: TourProps["steps"] = [
    {
      title: "Liste des demandes",
      description: (
        <>
          <p>Ce tableau contient la liste des demandes que vous pouvez consulter.</p>
          <p>
            Une demande possède un état :{" "}
            <Space wrap size={2}>
              <EtatDemandeAvatar etatDemandeId={ETAT_DEMANDE_ATTENTE_COMMISSION} />
              <EtatDemandeAvatar etatDemandeId={ETAT_DEMANDE_CONFORME} />
              <EtatDemandeAvatar etatDemandeId={ETAT_DEMANDE_VALIDEE} />
              <span>...</span>
            </Space>
          </p>
          <p>
            Vous pouvez consulter le contenu d'une demande en cliquant sur le bouton{" "}
            <Button icon={<EyeOutlined />}>Voir</Button> en fin de ligne.
          </p>
        </>
      ),
      target: () => props.refs.table.current as HTMLElement,
    },
    {
      title: "Filtrer les demandes",
      description: (
        <>
          <p>
            Vous pouvez filtrer les demandes en fonction de différents critères en cliquant sur
            "Filtres complémentaires".
          </p>
          <p>
            Vous pouvez par exemple n'afficher que les demandes en attente de commission, que les
            demandes d'étudiants inscrits à une formation ou que les demandes d'une discipline
            sportive.
          </p>
          <p>
            Ces filtres peuvent être <span className="semi-bold">cumulés</span>.
          </p>
        </>
      ),
      target: () => props.refs.filtres.current as HTMLElement,
      scrollIntoViewOptions: false,
    },
    {
      title: "Enregistrer un filtre",
      description: (
        <>
          <p>
            Si vous consultez fréquemment les mêmes types de demandes, vous pouvez enregistrer des
            filtres de recherche personnels. Vous pouvez alors les appliquer en un clic.
          </p>
        </>
      ),
      target: () => props.refs.favoris.current as HTMLElement,
      // scrollIntoViewOptions: true,
    },
  ];

  return openState ? (
    <Tour
      disabledInteraction
      current={currentStep}
      steps={steps}
      open
      onClose={() => props.setOpen(false)}
      onChange={(c) => setCurrentStep(c)}
    />
  ) : null;
}
