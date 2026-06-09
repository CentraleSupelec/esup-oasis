/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Button, Space, Tooltip } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useAffichageFiltres } from "@context/affichageFiltres/AffichageFiltresContext";
import { affichageNbJours, calculateRange, rangeToLabel } from "@utils/dates";

export default function ToolbarNavigation() {
  const screens = useBreakpoint();
  const { affichageFiltres, setFiltres } = useAffichageFiltres();
  const step = affichageNbJours(affichageFiltres.affichage.type, affichageFiltres.filtres.debut);

  return (
    <Space>
      <Space.Compact>
        <Button
          data-testid="toolbar-btn-prev"
          size="large"
          aria-label="Consulter la période précédente"
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            setFiltres({
              debut: dayjs(affichageFiltres.filtres.debut).subtract(step, "days").toDate(),
              fin: dayjs(affichageFiltres.filtres.fin).subtract(step, "days").toDate(),
            })
          }
        />
        {screens.lg && (
          <Tooltip title="Afficher aujourd'hui">
            <Button
              className="light"
              size="large"
              aria-label="Afficher aujourd'hui"
              onClick={() => {
                const range = calculateRange(new Date(), affichageFiltres.affichage.type);
                setFiltres({ debut: range.from, fin: range.to });
              }}
            >
              <CalendarOutlined />
            </Button>
          </Tooltip>
        )}
        <Button
          data-testid="toolbar-btn-next"
          size="large"
          aria-label="Consulter la période suivante"
          icon={<ArrowRightOutlined />}
          className="mr-2"
          onClick={() =>
            setFiltres({
              debut: dayjs(affichageFiltres.filtres.debut).add(step, "days").toDate(),
              fin: dayjs(affichageFiltres.filtres.fin).add(step, "days").toDate(),
            })
          }
        />
      </Space.Compact>
      {screens.md && rangeToLabel(affichageFiltres.filtres.debut, affichageFiltres.filtres.fin)}
    </Space>
  );
}
