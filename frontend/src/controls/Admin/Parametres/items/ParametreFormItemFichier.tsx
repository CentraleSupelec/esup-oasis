/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Avatar, Button, Card, DatePicker, Space } from "antd";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { IParametreValeur } from "@api";
import { getLibellePeriode, isEnCoursSurPeriode } from "@utils/dates";
import { FichierDepot } from "@controls/Fichier/FichierDepot";
import { Fichier } from "@controls/Fichier/Fichier";

interface ParametreFormItemFichierProps {
  valeur?: IParametreValeur;
  editingItem: IParametreValeur | undefined;
  setEditingItem: (value: IParametreValeur | undefined) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export function ParametreFormItemFichier(props: ParametreFormItemFichierProps): ReactElement {
  if (props.editingItem) {
    return (
      <Card className="mb-2">
        <Card.Meta
          title={<>Édition de la valeur du paramètre</>}
          avatar={<EditOutlined />}
          description={
            <Space orientation="vertical" className="text-text w-100">
              <Space>
                <span>Début</span>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={props.editingItem?.debut ? dayjs(props.editingItem?.debut) : undefined}
                  onChange={(date) => {
                    props.setEditingItem({
                      ...props.editingItem,
                      debut: date?.format("YYYY-MM-DD") as string,
                    } as IParametreValeur);
                  }}
                />
              </Space>
              <Space>
                <span>Fin</span>
                <DatePicker
                  format="DD/MM/YYYY"
                  defaultValue={props.editingItem?.fin ? dayjs(props.editingItem?.fin) : undefined}
                  onChange={(date) => {
                    props.setEditingItem({
                      ...props.editingItem,
                      debut: props.editingItem?.debut as string,
                      fin: date?.format("YYYY-MM-DD") as string,
                    } as IParametreValeur);
                  }}
                />
              </Space>
              <Space orientation="vertical" className="w-100">
                <span>Fichier</span>
                <FichierDepot
                  onAdded={(fichier) => {
                    props.setEditingItem({
                      ...props.editingItem,
                      debut: props.editingItem?.debut as string,
                      fichier: fichier["@id"] as string,
                    } as IParametreValeur);
                  }}
                />
              </Space>
              <Space className="mt-2">
                <Button
                  onClick={() => {
                    props.onCancel?.();
                    props.setEditingItem(undefined);
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => {
                    props.onSubmit?.();
                  }}
                >
                  Enregistrer
                </Button>
              </Space>
            </Space>
          }
        />
      </Card>
    );
  }

  return (
    <Card className="mb-2">
      <Card.Meta
        title={
          <>
            {getLibellePeriode(props.valeur?.debut, props.valeur?.fin)}
            <Space className="float-right">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  props.setEditingItem(props.valeur);
                }}
              />
            </Space>
          </>
        }
        avatar={
          isEnCoursSurPeriode(props.valeur?.debut, props.valeur?.fin) ? (
            <Avatar size="small" className="bg-success" />
          ) : (
            <Avatar size="small" />
          )
        }
        description={
          <>
            <Fichier fichierId={props.valeur?.fichier as string} />
          </>
        }
      />
    </Card>
  );
}
