/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useMemo } from "react";
import { App, Button } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { CampusItem } from "@controls/Items/CampusItem";
import { EtudiantItem } from "@controls/Items/EtudiantItem";
import { GestionnaireItem } from "@controls/Items/GestionnaireItem";
import { TypeEquipementItem } from "@controls/Items/TypeEquipementItem";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";
import dayjs from "dayjs";
import { IEvenement } from "@api";
import { RoleValues } from "@lib";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

interface IEventCopyButtonProps {
  evenement: IEvenement;
  onCopy?: () => void;
}

/**
 * Renders a button to copy an event to the clipboard.
 * @function EventCopyButton
 * @param {object} props - The props object
 * @param {IEvenement} props.evenement - The event object containing information about the event
 * @param {Function} props.onCopy - The callback function to execute when the event is copied
 * @returns {ReactElement} - The copy button element
 */
export default function EventCopyButton({
  evenement,
  onCopy,
}: IEventCopyButtonProps): ReactElement {
  const screens = useBreakpoint();
  const { message } = App.useApp();
  const ref = React.useRef<HTMLDivElement>(null);

  return useMemo(
    () => (
      <>
        <div ref={ref} className="d-none">
          {evenement.libelle ? `Libellé :${evenement.libelle}\n` : ""}
          Catégorie : <TypeEvenementItem typeEvenementId={evenement.type} showAvatar={false} />
          {"\n"}
          Date : le {dayjs(evenement.debut).format("dddd DD MMM YYYY")} de{" "}
          {dayjs(evenement.debut).format("HH:mm")} à {dayjs(evenement.fin).format("HH:mm")}
          {"\n\n"}
          Bénéficiaire{(evenement.beneficiaires || []).length > 1 ? "s" : ""} :{" "}
          {evenement.beneficiaires?.map((b) => (
            <div key={b}>
              <EtudiantItem key={b} utilisateurId={b} showAvatar={false} />
              {"\n"}
            </div>
          ))}
          {(evenement.beneficiaires || []).length === 0 && "Aucun bénéficiare associé"}
          {"\n"}
          Intervenant :{" "}
          <EtudiantItem
            utilisateurId={evenement.intervenant || undefined}
            role={RoleValues.ROLE_INTERVENANT}
            showAvatar={false}
          />
          {evenement.intervenant === undefined && "Aucun intervenant associé"}
          {"\n\n"}
          Enseignant{(evenement.enseignants || []).length > 1 ? "s" : ""} :{" "}
          {evenement.enseignants?.map((b) => (
            <div key={b}>
              <GestionnaireItem key={b} gestionnaireId={b} showAvatar={false} />
              {"\n"}
            </div>
          ))}
          {(evenement.enseignants || []).length === 0 && "Aucun enseignant associé"}
          {"\n\n"}
          Localisation : <CampusItem campusId={evenement.campus} showAvatar={false} /> /{" "}
          {evenement.salle ? evenement.salle : "Aucune salle associée"}
          {"\n\n"}
          Equipements :{" "}
          {evenement.equipements?.map((eqpt) => (
            <div key={eqpt}>
              <TypeEquipementItem typeEquipementId={eqpt} />
              {"\n"}
            </div>
          ))}
          {(evenement.equipements || []).length === 0 && "Aucun équipement associé"}
        </div>
        <Button
          icon={<CopyOutlined />}
          aria-label="Copier l'événement dans le presse-papier"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard
              .writeText(ref.current?.innerText || "")
              .then(() => onCopy?.())
              .catch(() => {
                message
                  .error(
                    "Impossible de copier le texte, le navigateur n'a pas accès à votre presse-papier.",
                  )
                  .then();
              });
          }}
        >
          {screens.lg ? "Copier" : null}
        </Button>
      </>
    ),
    [evenement, onCopy, screens.lg, message],
  );
}
