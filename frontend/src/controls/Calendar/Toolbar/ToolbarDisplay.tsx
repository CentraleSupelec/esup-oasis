/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Button, Dropdown, Segmented, Space } from "antd";
import {
  CalendarOutlined,
  CheckOutlined,
  MinusOutlined,
  MoreOutlined,
  TableOutlined,
} from "@ant-design/icons";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useAuth } from "@/auth/AuthProvider";
import {
  DensiteValues,
  PlanningLayout,
  TypeAffichageValues,
  useAffichageFiltres,
} from "@context/affichageFiltres/AffichageFiltresContext";
import ProgressAffectation from "@controls/Progress/ProgressAffectation";
import { Evenement } from "@lib";
import { ItemType } from "antd/es/menu/interface";

interface IToolbarDisplay {
  saisieEvtRenfort?: boolean;
  evenements: Evenement[];
}

export default function ToolbarDisplay({ saisieEvtRenfort, evenements }: IToolbarDisplay) {
  const screens = useBreakpoint();
  const auth = useAuth();
  const { affichageFiltres, setAffichage, setFiltres } = useAffichageFiltres();

  function menuAffichageSmall() {
    function menuAffichageToggle(key: TypeAffichageValues, label: string) {
      return {
        key: key,
        label: label,
        className: affichageFiltres.affichage.type === key ? "active" : "",
        onClick: () =>
          setAffichage({
            type: key,
          }),
        icon: (
          <CheckOutlined className={affichageFiltres.affichage.type === key ? "" : "v-hidden"} />
        ),
      };
    }

    if (screens.lg) return [];

    return [
      {
        key: "today",
        label: "Aujourd'hui",
        onClick: () => setFiltres({ debut: new Date(), fin: new Date() }),
        icon: <CalendarOutlined />,
      },
      {
        key: "divider-2",
        type: "divider",
      },
      {
        key: "title-filtre",
        type: "group",
        label: "Période affichée",
      },
      menuAffichageToggle("month", "Mois"),
      menuAffichageToggle("week", "Semaine"),
      menuAffichageToggle("work_week", "5 jours"),
      menuAffichageToggle("day", "Jour"),
      {
        key: "divider-3",
        type: "divider",
      },
    ];
  }

  function menuAffichage(): ItemType[] {
    return [
      ...(menuAffichageSmall() as ItemType[]),
      {
        key: "title-densite",
        type: "group",
        label: "Densité d'affichage",
      },
      {
        key: "normal",
        label: "Normal",
        className: affichageFiltres.affichage.densite === DensiteValues.normal ? "active" : "",
        icon: (
          <CheckOutlined
            className={
              affichageFiltres.affichage.densite === DensiteValues.normal ? "" : "v-hidden"
            }
          />
        ),
        onClick: () => setAffichage({ densite: DensiteValues.normal }),
      },
      {
        key: "large",
        label: "Large",
        className: affichageFiltres.affichage.densite === DensiteValues.large ? "active" : "",
        icon: (
          <CheckOutlined
            className={affichageFiltres.affichage.densite === DensiteValues.large ? "" : "v-hidden"}
          />
        ),
        onClick: () => setAffichage({ densite: DensiteValues.large }),
      },
    ];
  }

  return (
    <Space separator={<MinusOutlined className="text-grey" rotate={90} />}>
      {!saisieEvtRenfort && auth.user?.isPlanificateur && (
        <ProgressAffectation evenements={evenements} />
      )}
      <div>
        <div className="sr-only">Mode d'affichage du planning</div>
        <Segmented
          value={affichageFiltres.affichage.layout}
          onChange={(value) => {
            setAffichage({ layout: value as PlanningLayout });
          }}
          options={[
            {
              value: PlanningLayout.calendar,
              label: <CalendarOutlined aria-label="Vue calendrier" />,
            },
            {
              value: PlanningLayout.table,
              label: <TableOutlined aria-label="Vue tableau" />,
            },
          ]}
        />
      </div>
      {screens.lg ? (
        <div>
          <div className="sr-only">Durée de la période affichée</div>
          <Segmented
            className="light"
            options={[
              { value: "day", label: "Jour" },
              { value: "work_week", label: "5 jours" },
              { value: "week", label: "Semaine" },
              { value: "month", label: "Mois" },
            ]}
            value={affichageFiltres.affichage.type}
            onChange={(value) =>
              setAffichage({
                type: value as TypeAffichageValues,
              })
            }
          />
        </div>
      ) : null}
      {affichageFiltres.affichage.layout === PlanningLayout.calendar ? (
        <Dropdown
          menu={{
            items: menuAffichage(),
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            className="contrast-no-border mr-2"
            size="large"
            aria-label="Affichage"
            icon={<MoreOutlined aria-hidden />}
          />
        </Dropdown>
      ) : null}
    </Space>
  );
}
