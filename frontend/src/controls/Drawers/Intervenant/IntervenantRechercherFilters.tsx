/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect } from "react";
import { Button, Collapse, Form, FormInstance, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { TabTypeEvenement } from "@controls/TabsContent/TabTypeEvenement";
import { TabCompetence } from "@controls/TabsContent/TabCompetence";
import { TabCampus } from "@controls/TabsContent/TabCampus";
import { CampusItem } from "@controls/Items/CampusItem";
import { CompetenceItem } from "@controls/Items/CompetenceItem";
import { TypeEvenementItem } from "@controls/Items/TypeEvenementItem";

export interface IFiltreRechercheIntervenant {
  nom?: string;
  "intervenant.campuses"?: string;
  "intervenant.typesEvenements"?: string;
  "intervenant.competences"?: string;
  beneficiaire?: string;
  "creneau[debut]"?: string;
  "creneau[fin]"?: string;
}

interface IntervenantRechercherFiltersProps {
  form: FormInstance;
  filtreRecherche: IFiltreRechercheIntervenant;
  setFiltreRecherche: React.Dispatch<React.SetStateAction<IFiltreRechercheIntervenant>>;
  onSearch: () => void;
  loading?: boolean;
  afficherFiltres: boolean;
}

const IntervenantRechercherFilters: React.FC<IntervenantRechercherFiltersProps> = ({
  form,
  filtreRecherche,
  setFiltreRecherche,
  onSearch,
  loading,
  afficherFiltres,
}) => {
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(filtreRecherche);
  }, [filtreRecherche, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSearch}
      initialValues={filtreRecherche}
      onValuesChange={(changedValues) => {
        setFiltreRecherche((prev) => ({ ...prev, ...changedValues }));
      }}
    >
      {afficherFiltres && (
        <>
          <Typography.Title level={4} className="mb-2">
            Rechercher un intervenant selon les critères de l'évènement
          </Typography.Title>
          <Collapse defaultActiveKey="competences">
            <Collapse.Panel
              key="campus"
              header="Campus de l'évènement"
              extra={
                filtreRecherche["intervenant.campuses"] ? (
                  <Tag
                    color="processing"
                    closable
                    onClose={() => {
                      setFiltreRecherche((prev) => ({
                        ...prev,
                        "intervenant.campuses": undefined,
                      }));
                    }}
                  >
                    <CampusItem
                      showAvatar={false}
                      campusId={filtreRecherche["intervenant.campuses"]}
                    />
                  </Tag>
                ) : null
              }
            >
              <TabCampus />
            </Collapse.Panel>
            <Collapse.Panel
              key="typeEvenement"
              header="Catégorie de l'évènement"
              extra={
                filtreRecherche["intervenant.typesEvenements"] ? (
                  <Tag
                    className="tag-ellipsis"
                    closable
                    onClose={() => {
                      setFiltreRecherche((prev) => ({
                        ...prev,
                        "intervenant.typesEvenements": undefined,
                      }));
                    }}
                  >
                    <TypeEvenementItem
                      showAvatar={false}
                      typeEvenementId={filtreRecherche["intervenant.typesEvenements"]}
                      styleLibelle={{
                        maxWidth: 150,
                        textOverflow: "ellipsis",
                        overflowX: "hidden",
                      }}
                    />
                  </Tag>
                ) : null
              }
            >
              <TabTypeEvenement />
            </Collapse.Panel>
            <Collapse.Panel
              header="Compétences requises pour l'évènement"
              key="competences"
              extra={
                filtreRecherche["intervenant.competences"] ? (
                  <Tag
                    className="tag-ellipsis"
                    closable
                    onClose={() => {
                      setFiltreRecherche((prev) => ({
                        ...prev,
                        "intervenant.competences": undefined,
                      }));
                    }}
                  >
                    <CompetenceItem
                      competenceId={filtreRecherche["intervenant.competences"]}
                      showAvatar={false}
                      styleLibelle={{
                        maxWidth: 150,
                        textOverflow: "ellipsis",
                        overflowX: "hidden",
                      }}
                    />
                  </Tag>
                ) : null
              }
            >
              <TabCompetence />
            </Collapse.Panel>
          </Collapse>
        </>
      )}

      <Form.Item className="mt-2 text-center">
        <Button
          type="primary"
          icon={<SearchOutlined />}
          htmlType="submit"
          size="large"
          loading={loading}
        >
          Rechercher
        </Button>
      </Form.Item>
    </Form>
  );
};

export default IntervenantRechercherFilters;
