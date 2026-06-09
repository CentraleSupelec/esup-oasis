/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Button, Card, Form, FormInstance, Select, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { capitalize } from "@utils/string";
import UtilisateurFormItemSelect from "@controls/Forms/UtilisateurFormItemSelect";
import { RoleValues } from "@lib";
import PeriodeField from "@controls/Forms/PeriodeField";
import {
  BilanExportButton,
  IActiviteExport,
} from "@routes/administration/Bilans/BeneficiairesIntervenants/components/BilanExportButton";
import { IPeriode } from "@api";

export interface BilanFilterValues {
  utilisateur?: string;
  "periode[]"?: IPeriode[];
  "campus[]"?: string[];
  "type[]"?: string[];
}

interface BilanFilterFormProps {
  type: "bénéficiaire" | "intervenant";
  form: FormInstance;
  onFinish: (values: BilanFilterValues) => void;
  onValuesChange: () => void;
  isFetching: boolean;
  isFetchingCampus: boolean;
  isFetchingTypesEvenements: boolean;
  campusOptions?: { label: string; value: string }[];
  typesEvenementsOptions?: { label: string; value: string; className: string }[];
  submitted: boolean;
  data?: IActiviteExport[];
  totalItems?: number;
}

export const BilanFilterForm: React.FC<BilanFilterFormProps> = ({
  type,
  form,
  onFinish,
  onValuesChange,
  isFetching,
  isFetchingCampus,
  isFetchingTypesEvenements,
  campusOptions,
  typesEvenementsOptions,
  submitted,
  data,
  totalItems,
}) => {
  return (
    <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={onValuesChange}>
      <Card
        title={
          <Space>
            <FilterOutlined />
            Définition des filtres du bilan
          </Space>
        }
        actions={
          [
            !submitted && (
              <Button
                size="large"
                type={!data ? "primary" : undefined}
                htmlType="submit"
                loading={isFetching}
              >
                Demander le bilan
              </Button>
            ),
            submitted && totalItems !== undefined && (
              <BilanExportButton type={type} data={data} totalItems={totalItems} />
            ),
            submitted && totalItems !== undefined && (
              <Button
                size="large"
                onClick={() => {
                  form.resetFields();
                  onValuesChange();
                }}
              >
                Réinitialiser
              </Button>
            ),
          ].filter((a) => a) as React.ReactNode[]
        }
      >
        <Form.Item name="utilisateur" label={capitalize(type)}>
          <UtilisateurFormItemSelect
            placeholder={`Tous les ${type}s`}
            forcerRechercheGlobale={false}
            roleUtilisateur={
              type === "bénéficiaire" ? RoleValues.ROLE_BENEFICIAIRE : RoleValues.ROLE_INTERVENANT
            }
          />
        </Form.Item>
        <Form.Item name="periode[]" label="Périodes">
          <PeriodeField mode="tags" placeholder="Toutes les périodes" />
        </Form.Item>
        <Form.Item name="campus[]" label="Campus">
          <Select
            mode="tags"
            loading={isFetchingCampus}
            placeholder="Tous les campus"
            options={campusOptions}
          />
        </Form.Item>
        <Form.Item name="type[]" label="Catégorie d'évènement">
          <Select
            mode="tags"
            loading={isFetchingTypesEvenements}
            placeholder="Toutes les catégories"
            options={typesEvenementsOptions}
          />
        </Form.Item>
      </Card>
    </Form>
  );
};
