/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Tour, TourProps } from "antd";
import { RefsTourDemande } from "@routes/gestionnaire/demandeurs/Demande";

export function DemandeurTour(props: {
  setOpen: (value: boolean) => void;
  refs: RefsTourDemande;
  open: boolean;
}) {
  const [currentStep, setCurrentStep] = React.useState<number>(0);

  const steps: TourProps["steps"] = [
    {
      title: "Avancement de la demande",
      description: (
        <>
          <p>
            Cette 1<sup>ère</sup> section vous permet de suivre l'
            <span className="semi-bold">avancement de la demande</span>.
          </p>
          <p>
            Selon les propriétés de votre compte, vous pouvez interagir pour, par exemple, affecter
            un profil à l'étudiant•e ou valider la demande.
          </p>
        </>
      ),
      target: () => props.refs.avancement.current as HTMLElement,
    },
    {
      title: "Contenu de la demande",
      description: (
        <>
          <p>Vous pouvez ensuite consulter le contenu de la demande.</p>
          <p>
            Plusieurs catégories d'informations sont disponibles : identité, informations générales,
            pièces justificatives, ...
          </p>
          <p>
            Vous pouvez <b>naviguer entre les différentes sections</b> en cliquant sur les onglets.
          </p>
        </>
      ),
      target: () => props.refs.dossier.current as HTMLElement,
      placement: "bottom",
      scrollIntoViewOptions: false,
    },
  ];

  return (
    <Tour
      current={currentStep}
      disabledInteraction
      steps={steps}
      open={props.open}
      onClose={() => props.setOpen(false)}
      onChange={(c) => setCurrentStep(c)}
    />
  );
}
