/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { App, Button, Card, Drawer, Form, Typography } from "antd";
import { useApi } from "@context/api/ApiProvider";
import Spinner from "@controls/Spinner/Spinner";
import { PlusOutlined } from "@ant-design/icons";
import ParametreFormItem from "@controls/Admin/Parametres/ParametreFormItem";

interface ParametresEditionProps {
  parametreId: string;
  onClose: () => void;
}

/**
 * Renders a form to edit a parameter from the referential.
 *
 * @param {object} parametreId - The ID of the parameter.
 * @param {function} onClose - The function to execute when the form is closed.
 *
 * @return {ReactElement | null} The rendered form.
 */
export default function ParametresEdition({
  parametreId,
  onClose,
}: ParametresEditionProps): ReactElement | null {
  const { message } = App.useApp();
  const { data: parametre, isFetching } = useApi().useGetItem({
    path: `/parametres/{cle}`,
    url: parametreId,
    enabled: !!parametreId,
  });

  if (isFetching || !parametre) return <Spinner />;

  if (!parametre["@id"]) {
    message.error("Le paramètre n'existe pas.").then();
    onClose();
    return null;
  }

  return (
    <Drawer
      open
      title="Éditer un paramètre du référentiel"
      onClose={onClose}
      size="large"
      className="bg-light-grey"
    >
      <Card
        title={`Paramètre : ${parametre.cle}`}
        actions={[
          <Button type="primary" onClick={onClose}>
            Fermer
          </Button>,
        ]}
      >
        <Typography.Text strong>Valeurs du paramètre</Typography.Text>
        <br />
        <Form initialValues={parametre} className="mt-2">
          <Form.List name="valeurs">
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, ...field }) => (
                  <Form.Item className="mb-0" required key={key}>
                    <Form.Item
                      {...field}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Une valeur est nécessaire ou supprimez ce champ.",
                        },
                      ]}
                      noStyle
                    >
                      <ParametreFormItem
                        parametre={parametre}
                        onCancel={() => {
                          remove(field.name);
                        }}
                      />
                    </Form.Item>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="link"
                    onClick={() => {
                      add();
                    }}
                    icon={<PlusOutlined />}
                    className="p-0 mt-0 fs-09"
                  >
                    Ajouter une valeur
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Card>
    </Drawer>
  );
}
