/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import "../../routes/administration/Administration.scss";
import { Space } from "antd";
import dayjs from "dayjs";
import TypeEvenementItem from "../Items/TypeEvenementItem";
import { ColumnType } from "antd/es/table";
import { FilterProps } from "../../utils/table";
import { FiltreValidationInterventions } from "./ValidationInterventionTable";
import { FilterFilled, FilterOutlined } from "@ant-design/icons";
import moment from "moment";
import { IEvenement, ITypeEvenement } from "../../api/ApiTypeHelpers";
import EtudiantItem from "../Items/EtudiantItem";
import { RoleValues } from "../../lib/Utilisateur";

import { UseStateDispatch } from "../../utils/utils";

interface TableValidationInterventionsProps {
   filter: FiltreValidationInterventions;
   setFilter: UseStateDispatch<FiltreValidationInterventions>;
   typesEvenements?: ITypeEvenement[];
}

export default function validationInterventionTableColumns({
   filter,
   setFilter,
   typesEvenements,
}: TableValidationInterventionsProps): ColumnType<IEvenement>[] {
   return [
      {
         title: "Date",
         dataIndex: "debut",
         key: "debut",
         render: (date: Date, record: IEvenement) => {
            return (
               <>
                  {moment(date).format("DD/MM/YYYY")}
                  <br />
                  <span className="text-legende">
                     {moment(record.debut).format("HH:mm")} à {moment(record.fin).format("HH:mm")}
                  </span>
               </>
            );
         },
      },
      {
         title: "Renfort",
         dataIndex: "intervenant",
         render: (value) => (
            <EtudiantItem utilisateurId={value} role={RoleValues.ROLE_INTERVENANT} />
         ),
         ...FilterProps<FiltreValidationInterventions>("nomIntervenant", filter, setFilter),
      } as ColumnType<IEvenement>,
      {
         title: "Catégorie",
         dataIndex: "type",
         render: (value) => <TypeEvenementItem showAvatar={false} typeEvenementId={value} />,
         filters: typesEvenements
            ?.filter((te) => te.actif)
            .filter((te) => te.avecValidation)
            .map((te) => ({
               text: <TypeEvenementItem typeEvenementId={te["@id"]} showAvatar={false} />,
               value: te["@id"] as string,
            })),
         filterIcon: () =>
            filter["type[]"] ? <FilterFilled className="text-primary" /> : <FilterOutlined />,
      },
      {
         title: "Durée",
         dataIndex: "duree",
         render: (value, record) => {
            const nbMinutes = dayjs(record.fin).diff(dayjs(record.debut), "minute");
            // Non nécessaire sur evt renforts, on conserve pr autres évt
            const dureeSupplementaire =
               (record.tempsSupplementaire || 0) + (record.tempsPreparation || 0);
            return (
               <Space orientation="vertical" size={0}>
                  <Space>
                     {nbMinutes}
                     {dureeSupplementaire > 0 && <span> + {dureeSupplementaire}</span>} minutes
                  </Space>
                  {record.dateAnnulation && (
                     <span className="text-danger">
                        {" "}
                        (annulée le {dayjs(record.dateAnnulation).format("DD/MM/YYYY")})
                     </span>
                  )}
               </Space>
            );
         },
      },
   ];
}
