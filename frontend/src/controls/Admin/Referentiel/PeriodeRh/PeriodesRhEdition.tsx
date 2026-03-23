/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useApi } from "../../../../context/api/ApiProvider";
import { createDateAsUTC, toDate, toDayValue } from "../../../../utils/dates";
import dayjs from "dayjs";
import { Calendar, DayRange } from "../../../../lib/react-modern-calendar-datepicker";
import { Alert, Button, Card, DatePicker, Drawer, Space, Switch, Typography } from "antd";
import { modernCalendarLocaleFr } from "../../../../lib/react-modern-calendar-datepicker/SmallCalendarLocale";
import { SendOutlined, WarningFilled } from "@ant-design/icons";
import React, { ReactElement } from "react";
import "../../../Calendar/Sider/SmallCalendar/SmallCalendar.scss";

import { IPeriode } from "../../../../api/ApiTypeHelpers";

interface PeriodesRhEditionProps {
   periode: IPeriode;
   setPeriode: (item: IPeriode | undefined) => void;
}

/**
 * Editing component for a PeriodeRhItem.
 *
 * @param {IPeriode} periode - The periode object to be edited or added.
 * @param {Function} setPeriode - The function to set the periode state.
 * @return {ReactElement} - The JSX element representing the PeriodesRhEdition component.
 */
export function PeriodesRhEdition({ periode, setPeriode }: PeriodesRhEditionProps): ReactElement {
   const mutationPost = useApi().usePost({
      path: "/periodes",
      invalidationQueryKeys: ["/periodes"],
      onSuccess: () => {
         setPeriode(undefined);
      },
   });
   const mutationPatch = useApi().usePatch({
      path: `/periodes/{id}`,
      invalidationQueryKeys: ["/periodes"],
      onSuccess: () => {
         setPeriode(undefined);
      },
   });

   function createOrUpdate() {
      if (!periode) return;

      const data = {
         ...periode,
         debut: createDateAsUTC(dayjs(periode.debut).startOf("day").toDate()).toISOString(),
         fin: createDateAsUTC(dayjs(periode.fin).endOf("day").toDate()).toISOString(),
         butoir: createDateAsUTC(dayjs(periode.butoir).endOf("day").toDate()).toISOString(),
      };

      if (periode["@id"] === undefined) {
         // Création
         mutationPost?.mutate({
            data,
         });
      } else {
         // Modification
         mutationPatch?.mutate({
            "@id": periode["@id"],
            data,
         });
      }
   }

   function setSelectedDayRange(value: DayRange) {
      if (!periode) return;
      setPeriode({
         ...periode,
         debut: value.from ? createDateAsUTC(toDate(value.from)).toISOString() : null,
         fin: value.to ? createDateAsUTC(toDate(value.to)).toISOString() : null,
      });
   }

   return (
      <Drawer
         open
         title={
            periode["@id"]
               ? "Éditer un élément du référentiel"
               : "Ajouter un élément au référentiel"
         }
         onClose={() => setPeriode(undefined)}
         size="large"
         className="bg-light-grey"
      >
         <Card
            title="Période RH"
            actions={[
               <Button
                  type="primary"
                  disabled={!periode.debut || !periode.fin || !periode.butoir}
                  onClick={createOrUpdate}
               >
                  Enregistrer
               </Button>,
            ]}
         >
            <Typography.Text strong>Période</Typography.Text>
            <br />
            <Calendar
               value={{
                  from: periode.debut ? toDayValue(new Date(periode.debut)) : null,
                  to: periode.fin ? toDayValue(new Date(periode.fin)) : null,
               }}
               shouldHighlightWeekends
               locale={modernCalendarLocaleFr}
               colorPrimary="var(--color-app)"
               colorPrimaryLight="var(--color-app)"
               calendarClassName="small-calendar"
               onChange={setSelectedDayRange}
            />

            <div className="mt-4">
               <Typography.Text strong>Date butoir</Typography.Text>
               <br />
               <DatePicker
                  className="w-100"
                  format="DD/MM/YYYY"
                  value={periode.butoir ? dayjs(periode.butoir) : null}
                  onChange={(date) => {
                     setPeriode({
                        ...periode,
                        butoir: date ? createDateAsUTC(date?.toDate()).toISOString() : null,
                     });
                  }}
                  changeOnBlur
               />
            </div>

            <div className="mt-4">
               <Typography.Text strong>Envoyé à la RH ?</Typography.Text>

               <Space orientation="vertical" className="mt-2">
                  <Alert
                     type="warning"
                     icon={<WarningFilled />}
                     showIcon
                     title="Envoi des évènements à la RH"
                     description="Les évènements contenus dans la période ne seront plus modifiables."
                  />
                  <Switch
                     disabled={periode["@id"] === undefined}
                     checked={periode.envoyee}
                     checkedChildren={<SendOutlined style={{ marginTop: 5 }} />}
                     onChange={(value) => {
                        setPeriode({
                           ...periode,
                           envoyee: value,
                        });
                     }}
                  />
               </Space>
            </div>
         </Card>
      </Drawer>
   );
}
