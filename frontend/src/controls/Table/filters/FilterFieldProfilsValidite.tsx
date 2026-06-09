/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useState } from "react";
import { Col, DatePicker, Radio, Space } from "antd";
import { FiltreBeneficiaire } from "@controls/Table/BeneficiaireTable";
import { Utilisateur } from "@lib";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

type ModeValidite = "date" | "intervalle" | "nimportequand";

interface FilterFieldProfilsValiditeProps {
  filtreBeneficiaire: FiltreBeneficiaire;
  setFiltreBeneficiaire: React.Dispatch<React.SetStateAction<FiltreBeneficiaire>>;
  user: Utilisateur | null | undefined;
}

export function FilterFieldProfilsValidite({
  filtreBeneficiaire,
  setFiltreBeneficiaire,
  user,
}: FilterFieldProfilsValiditeProps) {
  const isNimporteQuand =
    filtreBeneficiaire["filtreBeneficiaire[avant]"] !== undefined &&
    filtreBeneficiaire["filtreBeneficiaire[apres]"] === undefined &&
    filtreBeneficiaire["filtreBeneficiaire[date]"] === undefined;

  const hasIntervalle =
    !isNimporteQuand &&
    (filtreBeneficiaire["filtreBeneficiaire[avant]"] !== undefined ||
      filtreBeneficiaire["filtreBeneficiaire[apres]"] !== undefined);

  const [mode, setMode] = useState<ModeValidite>(
    isNimporteQuand ? "nimportequand" : hasIntervalle ? "intervalle" : "date",
  );

  if (!user?.isGestionnaire) {
    return null;
  }

  function handleModeChange(newMode: ModeValidite) {
    setMode(newMode);

    if (newMode === "date") {
      setFiltreBeneficiaire((prev) => ({
        ...prev,
        "filtreBeneficiaire[date]": dayjs().format("YYYY-MM-DD"),
        "filtreBeneficiaire[avant]": undefined,
        "filtreBeneficiaire[apres]": undefined,
        page: 1,
      }));
    } else if (newMode === "nimportequand") {
      setFiltreBeneficiaire((prev) => ({
        ...prev,
        "filtreBeneficiaire[date]": undefined,
        "filtreBeneficiaire[avant]": dayjs().add(1, "year").format("YYYY-MM-DD"),
        "filtreBeneficiaire[apres]": undefined,
        page: 1,
      }));
    } else {
      setFiltreBeneficiaire((prev) => ({
        ...prev,
        "filtreBeneficiaire[date]": undefined,
        "filtreBeneficiaire[avant]": undefined,
        "filtreBeneficiaire[apres]": undefined,
        page: 1,
      }));
    }
  }

  function handleRangeChange(dates: [Dayjs | null, Dayjs | null] | null) {
    setFiltreBeneficiaire((prev) => ({
      ...prev,
      "filtreBeneficiaire[date]": undefined,
      "filtreBeneficiaire[apres]": dates?.[0]?.format("YYYY-MM-DD") ?? undefined,
      "filtreBeneficiaire[avant]": dates?.[1]?.format("YYYY-MM-DD") ?? undefined,
      page: 1,
    }));
  }

  const rangeValue: [Dayjs | null, Dayjs | null] = [
    filtreBeneficiaire["filtreBeneficiaire[apres]"]
      ? dayjs(filtreBeneficiaire["filtreBeneficiaire[apres]"])
      : null,
    filtreBeneficiaire["filtreBeneficiaire[avant]"]
      ? dayjs(filtreBeneficiaire["filtreBeneficiaire[avant]"])
      : null,
  ];

  return (
    <>
      <Col xs={24} sm={24} md={6}>
        <Space orientation="vertical" size={0}>
          <span>Validité du profil</span>
        </Space>
      </Col>
      <Col xs={24} sm={24} md={18}>
        <Space orientation="vertical" size={8} className="w-100">
          <Radio.Group
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as ModeValidite)}
            orientation="horizontal"
          >
            <Radio value="date">Valide à la date du jour</Radio>
            <Radio value="intervalle">Valide sur une période</Radio>
            <Radio value="nimportequand">Sans restriction de date</Radio>
          </Radio.Group>
          {mode === "intervalle" && (
            <RangePicker
              className="w-100"
              value={rangeValue}
              onChange={handleRangeChange}
              format="DD/MM/YYYY"
              placeholder={["Date de début", "Date de fin"]}
              allowEmpty={[true, true]}
            />
          )}
        </Space>
      </Col>
    </>
  );
}
