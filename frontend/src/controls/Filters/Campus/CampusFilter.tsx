/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import { Avatar, Select, Space } from "antd";
import { useApi } from "@context/api/ApiProvider";
import { PREFETCH_CAMPUS } from "@api";

interface ICampusFilter {
  value?: string[];
  onChange?: (value: string[]) => void;
  mode?: "multiple" | "tags";
}

/**
 * Filter component for Campus.
 *
 * @param {Object} props - The props object
 * @param {string} props.value - The currently selected value of the filter
 * @param {function} props.onChange - The callback function to be called when the value of the filter changes
 *
 * @return {ReactElement} The JSX element representing the CampusFilter component
 */
export default function CampusFilter({ value, onChange, mode }: ICampusFilter): ReactElement {
  const [filter, setFilter] = useState("");
  const { data, isFetching } = useApi().useGetFullCollection(PREFETCH_CAMPUS);

  return (
    <Select
      data-testid="campus-filter"
      className="w-100"
      loading={isFetching}
      placeholder="Tous les campus"
      value={value}
      onChange={(v) => {
        if (onChange) onChange(v);
      }}
      allowClear
      showSearch={{
        filterOption: false,
        onSearch: (v) => setFilter(v.toLocaleLowerCase()),
      }}
      mode={mode}
      options={
        data?.items
          .filter((c) => c.actif)
          .filter((c) => c.libelle?.toLocaleLowerCase().includes(filter))
          .sort((a, b) => (a.libelle ?? "").localeCompare(b.libelle ?? ""))
          .map((c) => ({ value: c["@id"], label: c.libelle })) ?? []
      }
      optionRender={(option) => (
        <Space align="center">
          <Avatar
            className="avatar-campus"
            size={20}
            style={{ verticalAlign: "text-top", fontSize: 14 }}
          >
            {(option.label as string).charAt(0)}
          </Avatar>
          {option.label}
        </Space>
      )}
    />
  );
}
