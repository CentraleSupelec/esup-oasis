/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Alert, App, Space } from "antd";
import dayjs from "dayjs";
import { MinusOutlined } from "@ant-design/icons";
import { CalendarEvenement, RoleValues } from "@lib";
import { TYPE_EVENEMENT_RENFORT } from "@/constants";
import { CampusItem } from "@controls/Items/CampusItem";
import { EtudiantItem } from "@controls/Items/EtudiantItem";
import { GestionnaireItem } from "@controls/Items/GestionnaireItem";
import { TypeEquipementItem } from "@controls/Items/TypeEquipementItem";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";
import EventCopyButton from "@controls/Buttons/EventCopyButton";

interface CalendarEventPopoverContentProps {
  event: CalendarEvenement;
  contrast: boolean;
}

export const CalendarEventPopoverContent: React.FC<CalendarEventPopoverContentProps> = ({
  event,
  contrast,
}) => {
  const { notification } = App.useApp();

  return (
    <div>
      {event.data.dateAnnulation && (
        <Alert
          title="Évènement annulé"
          description="L'intervenant sera tout de même payé."
          type="warning"
          showIcon
          className="mb-2"
        />
      )}
      {!event.data.isAffecte() && (
        <Alert
          title="Évènement en attente d'affectation"
          description="Aucun intervenant n'est affecté à cet évènement."
          type="error"
          showIcon
          className="mb-2"
        />
      )}
      <Space orientation="vertical" size="small">
        <Space size="large">
          <div style={{ width: 100 }}>Date</div>
          <span className="light">{dayjs(event.data.debut).format("dddd DD MMM YYYY")}</span>
        </Space>
        <Space size="large">
          <div style={{ width: 100 }}>Horaires</div>
          <span className="light">
            de {dayjs(event.data.debut).format("HH:mm")} à {dayjs(event.data.fin).format("HH:mm")}
          </span>
        </Space>
        <Space size="large">
          <div style={{ width: 100 }}>Catégorie</div>
          <span className="light">
            <TypeEvenementItem typeEvenementId={event.data.type} forceBlackText={contrast} />
          </span>
        </Space>
        {event.data.type !== TYPE_EVENEMENT_RENFORT && (
          <Space size="large">
            <div style={{ width: 100 }}>Bénéficiaire</div>
            <Space orientation="vertical" className="light">
              {event.data.beneficiaires?.map((b) => (
                <EtudiantItem
                  key={b}
                  utilisateurId={b}
                  showTelephone
                  role={RoleValues.ROLE_BENEFICIAIRE}
                />
              ))}
            </Space>
          </Space>
        )}
        <Space size="large">
          <div style={{ width: 100 }}>
            {event.data.type === TYPE_EVENEMENT_RENFORT ? "Renfort" : "Intervenant"}
          </div>
          <span className="light">
            <EtudiantItem
              utilisateurId={event.data.intervenant}
              showTelephone
              role={RoleValues.ROLE_INTERVENANT}
            />
          </span>
        </Space>
        <Space size="large">
          <div style={{ width: 100 }}>
            Enseignant{(event.data.enseignants?.length || 0) > 1 ? "s" : ""}
          </div>
          <span className="light">
            <Space orientation="vertical">
              {event.data.enseignants?.map((b) => (
                <GestionnaireItem key={b} gestionnaireId={b} />
              )) || <MinusOutlined />}
            </Space>
          </span>
        </Space>
        <Space size="large">
          <div style={{ width: 100 }}>Localisation</div>
          <Space orientation="horizontal">
            <CampusItem className="light" campusId={event.data.campus} />
            {event.data.salle && (
              <>
                <span>/</span>
                <span className="light">{event.data.salle}</span>
              </>
            )}
          </Space>
        </Space>

        <Space size="large">
          <div style={{ width: 100 }}>Equipements</div>
          <Space orientation="vertical" className="light">
            {event.data.equipements?.map((e) => (
              <TypeEquipementItem key={e} typeEquipementId={e} />
            ))}
          </Space>
        </Space>
      </Space>
      <div className="event-commands mt-1">
        <div className="text-right w-100">
          <EventCopyButton
            evenement={event.data}
            onCopy={() => {
              notification.success({
                title: "Informations de l'évènement copiées dans le presse-papier",
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
