/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Evenement } from "@lib";
import { Button, Flex, Table } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import "@controls/Table/EvenementTable.scss";
import { useModals } from "@context/modals/ModalsContext";
import EvenementTableExport from "@controls/Table/EvenementTableExport";
import { useAuth } from "@/auth/AuthProvider";
import { evenementTableColumns } from "@controls/Table/EvenementTableColumns";

interface TableCalendarProps {
  events: Evenement[];
  saisieEvtRenfort?: boolean;
}

export default function EvenementTable({ events, saisieEvtRenfort = false }: TableCalendarProps) {
  const user = useAuth().user;
  const { setModalEvenementId } = useModals();

  return (
    <>
      <div className="text-right mb-1 mt-2">
        <Button icon={<ExportOutlined />} className="mr-1 d-none">
          Exporter
        </Button>
      </div>
      {user?.isPlanificateur && (
        <Flex justify="flex-end" align="center" className="mr-2 ml-2">
          <EvenementTableExport evenements={events} />
        </Flex>
      )}
      <Table<Evenement>
        className="calendar-table table-responsive mr-2"
        dataSource={events}
        rowKey="@id"
        rowClassName={(record) => {
          return record.isAffecte() ? "affecte" : `not-affecte`;
        }}
        columns={evenementTableColumns({
          afficherEtatEnvoiRh: user?.isPlanificateur,
          saisieEvtRenfort,
          onEvenementSelected: (evenement) => {
            setModalEvenementId(evenement["@id"] as string);
          },
        })}
        pagination={false}
      />
    </>
  );
}
