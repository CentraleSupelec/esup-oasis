/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ColumnType } from "antd/es/table";
import type { InputRef } from "antd";
import { Button, Input, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import React, { useRef } from "react";

import { UseStateDispatch } from "@utils/utils";

/**
 * Add filter props to a Table column.
 *
 * @template T - The type of props to filter
 * @param {keyof T} dataIndex - The key in props to filter on
 * @param filter
 * @param {UseStateDispatch<T>} setFilter - A function to set the filter object
 * @returns {ColumnType<IBeneficiaire>} - The filtered props
 */
export function FilterProps<T>(
  dataIndex: keyof T,
  filter: T,
  setFilter: UseStateDispatch<T>,
): Partial<ColumnType<T>> {
  const ref = useRef<InputRef>(null);
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={ref}
          placeholder="Rechercher..."
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm({ closeDropdown: true });
            setFilter((prev) => ({ ...prev, [dataIndex]: selectedKeys[0] }));
          }}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            onClick={() => {
              setFilter((prev) => {
                setSelectedKeys([""]);
                // confirm({ closeDropdown: true });
                return { ...prev, [dataIndex]: undefined };
              });
            }}
            size="small"
            type="link"
            disabled={!selectedKeys[0]}
          >
            Réinitialiser
          </Button>
          <Button
            type="primary"
            onClick={() => {
              confirm({ closeDropdown: true });
              setFilter((prev) => ({ ...prev, [dataIndex]: selectedKeys[0] }));
            }}
            icon={<FilterOutlined />}
            size="small"
            style={{ width: 130 }}
          >
            Filtrer
          </Button>
        </Space>
      </div>
    ),

    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => ref.current?.select(), 500);
        }
      },
    },
  };
}

export function getCountLibelle(count: number | undefined, libelle: string): string {
  if (count === undefined) {
    return "";
  }
  if (count === 0) {
    return `Aucun ${libelle}`;
  }
  if (count === 1) {
    return `1 ${libelle}`;
  }
  return `${count} ${libelle}s`;
}
