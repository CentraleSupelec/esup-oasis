/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useAuth } from "@/auth/AuthProvider";
import { useApi } from "@context/api/ApiProvider";
import { IPartialEvenement, PREFETCH_LAST_PERIODES_RH } from "@api";
import React, { ReactElement, useState } from "react";
import { Button, Col, DatePicker, Divider, Form, Row, TimePicker, Tooltip } from "antd";
import dayjs from "dayjs";
import { canCreateEventOnDate } from "@utils/dates";
import { InfoCircleOutlined, RedoOutlined, RightOutlined } from "@ant-design/icons";
import EvenementDupliquerModal from "@controls/Modals/Evenement/EvenementDupliquerModal";
import { Evenement } from "@lib";
import "dayjs/locale/fr";

dayjs.locale("fr"); // use loaded locale globally

interface TabEvenementPlanificationProps {
  evenement: Evenement | undefined;
  setEvenement: (data: IPartialEvenement | undefined, forceResetForm: boolean) => void;
  formIsDirty: boolean;
}

/**
 * TabEvenementPlanification component displays the planification tab for an event.
 * Date and time pickers are used to select the event start and end dates.
 * The component also provides a button to duplicate the event.
 *
 * @param {TabEvenementPlanificationProps} props - The component props
 * @param {Object} [props.evenement] - The evenement object
 * @param {Function} props.setEvenement - The function to set the evenement object
 * @param {boolean} props.formIsDirty - Indicates if the form is dirty
 * @returns {ReactElement} - The rendered component
 */
export function TabEvenementPlanification({
  evenement,
  setEvenement,
  formIsDirty,
}: TabEvenementPlanificationProps): ReactElement {
  const user = useAuth().user;
  // Dernière période dont la date butoir est dépassée
  const { data: lastPeriodes } = useApi().useGetCollection(PREFETCH_LAST_PERIODES_RH(user));
  const [dupliquer, setDupliquer] = useState(false);

  function updateHoraires(
    date: string | undefined,
    debut: string | undefined,
    fin: string | undefined,
  ) {
    const d = (date ? new Date(date) : new Date()).setHours(
      debut ? new Date(debut).getHours() : 0,
      debut ? new Date(debut).getMinutes() : 0,
      0,
      0,
    );
    const f = (date ? new Date(date) : new Date()).setHours(
      fin ? new Date(fin).getHours() : 0,
      fin ? new Date(fin).getMinutes() : 0,
      0,
      0,
    );

    setEvenement(
      {
        debut: new Date(d).toISOString(),
        fin: new Date(f).toISOString(),
      },
      true,
    );
  }

  return (
    <>
      <Divider>Planification</Divider>
      <Form.Item
        name="debut"
        label="Date"
        rules={[{ required: true }]}
        getValueProps={(i) => ({ value: i ? dayjs(i) : undefined })}
        required
      >
        <DatePicker
          className="w-100 text-center"
          format="DD/MM/YYYY"
          placeholder="Sélectionnez une date"
          picker="date"
          onChange={(e) => {
            updateHoraires(e?.toDate().toISOString(), evenement?.debut, evenement?.fin);
          }}
          disabledDate={(current) =>
            !canCreateEventOnDate(current.toDate(), user, lastPeriodes?.items[0])
          }
        />
      </Form.Item>
      <Row gutter={[16, 16]}>
        <Col span={11}>
          <Form.Item
            name="debut"
            label="Heure début"
            rules={[{ required: true }]}
            required
            getValueProps={(i) => ({ value: i ? dayjs(i) : undefined })}
          >
            <TimePicker
              className="text-center w-100"
              format="HH:mm"
              minuteStep={5}
              needConfirm={false}
              showNow={false}
              placeholder="00:00"
              onChange={(e) => {
                updateHoraires(
                  evenement?.debut || new Date().toISOString(),
                  e?.toDate().toISOString(),
                  evenement?.fin,
                );
              }}
            />
          </Form.Item>
        </Col>
        <Col span={2} className="d-flex-center">
          <RightOutlined className="mt-2" />
        </Col>
        <Col span={11}>
          <Form.Item
            id="fin"
            name="fin"
            label="Heure fin"
            rules={[
              { required: true },
              {
                validator: async (_, value) => {
                  if (value && evenement?.debut && new Date(value) <= new Date(evenement?.debut)) {
                    return Promise.reject(
                      new Error("L'heure de fin doit être supérieure à l'heure de début"),
                    );
                  }
                },
              },
            ]}
            required
            getValueProps={(i) => ({ value: i ? dayjs(i) : undefined })}
          >
            <TimePicker
              className="text-center w-100"
              format="HH:mm"
              minuteStep={5}
              showNow={false}
              placeholder="00:00"
              needConfirm={false}
              onChange={(e) => {
                updateHoraires(
                  evenement?.debut || new Date().toISOString(),
                  evenement?.debut,
                  e?.toDate().toISOString(),
                );
              }}
            />
          </Form.Item>
        </Col>
      </Row>

      {evenement && evenement["@id"] && (
        <div className="text-center mt-2 mb-2">
          <EvenementDupliquerModal evenement={evenement} open={dupliquer} setOpen={setDupliquer} />
          <Button disabled={formIsDirty} icon={<RedoOutlined />} onClick={() => setDupliquer(true)}>
            Dupliquer
          </Button>
          {formIsDirty && (
            <Tooltip title="Vous ne pouvez pas dupliquer un évènement si vous avez des modifications non enregistrées.">
              <InfoCircleOutlined className="ml-2 text-warning" />
            </Tooltip>
          )}
        </div>
      )}
    </>
  );
}
