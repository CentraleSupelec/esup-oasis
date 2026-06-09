/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactNode } from "react";
import { Badge, Collapse, Row, Space, Flex } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { FiltreFavoriDropDown } from "@controls/Table/FiltreFavoriDropDown";
import { FiltresFavoris } from "@controls/Table/FiltresFavoris";
import { UseStateDispatch } from "@utils/utils";
import { FiltreDecrivable } from "@controls/Table/FiltreDescription";

interface FilterPanelProps<T extends FiltreDecrivable> {
  filtre: T;
  setFiltre: UseStateDispatch<T>;
  filtreType: string;
  defaultFilter: T;
  children: ReactNode;
  extraLabel?: ReactNode;
  accordion?: boolean;
  activeKey?: string[];
  refDetails?: React.RefObject<HTMLDivElement>;
  refFavoris?: React.RefObject<HTMLDivElement>;
  refFiltres?: React.RefObject<HTMLDivElement>;
  /** Groupes de clés qui comptent collectivement pour 1 filtre au lieu d'une clé chacune. */
  groupedKeys?: string[][];
}

/**
 * Composant générique pour afficher un panneau de filtres avec favoris et filtres complémentaires.
 */
export function FilterPanel<T extends FiltreDecrivable>({
  filtre,
  setFiltre,
  filtreType,
  defaultFilter,
  children,
  extraLabel,
  accordion = true,
  activeKey,
  refDetails,
  refFavoris,
  refFiltres,
  groupedKeys = [],
}: FilterPanelProps<T>) {
  function calculerNombreFiltresPoses(): number {
    const excludedKeys = new Set(groupedKeys.flat());

    const filtresPose = Object.entries(filtre).filter(([key, value]) => {
      if (key === "page" || key === "itemsPerPage" || key.startsWith("order[")) return false;
      if (excludedKeys.has(key)) return false;
      const defaultValue = defaultFilter[key as keyof T];
      if (Array.isArray(value) || Array.isArray(defaultValue)) {
        const a = Array.isArray(value) ? value : [];
        const b = Array.isArray(defaultValue) ? defaultValue : [];
        return JSON.stringify(a) !== JSON.stringify(b);
      }
      return value !== defaultValue;
    });

    const groupsCount = groupedKeys.filter((group) =>
      group.some((key) => filtre[key as keyof T] !== defaultFilter[key as keyof T]),
    ).length;

    return filtresPose.length + groupsCount;
  }

  return (
    <Collapse
      ref={refDetails}
      accordion={accordion}
      activeKey={activeKey}
      className="mb-3"
      items={[
        {
          key: "filter_save",
          ref: refFavoris,
          label: (
            <Flex justify="space-between" align="center" gap={3} style={{ width: "100%" }}>
              <span>Filtres sauvegardés</span>
              <FiltreFavoriDropDown<T>
                className="mt-05"
                setFiltre={setFiltre}
                filtreType={filtreType}
              />
            </Flex>
          ),
          children: (
            <FiltresFavoris
              filtre={filtre}
              setFiltre={setFiltre}
              filtreType={filtreType}
              defaultFilter={defaultFilter}
            />
          ),
        },
        {
          key: "filters",
          ref: refFiltres,
          label: (
            <>
              <Space className="float-right">
                <Badge count={calculerNombreFiltresPoses()} />
                <FilterOutlined style={{ marginTop: 4 }} aria-hidden />
              </Space>
              Filtres complémentaires
              {extraLabel}
            </>
          ),
          children: <Row gutter={[16, 16]}>{children}</Row>,
        },
      ]}
    />
  );
}
