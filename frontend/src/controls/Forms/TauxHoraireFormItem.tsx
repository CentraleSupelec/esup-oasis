/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useState } from "react";
import { App, Avatar, Button, Card, DatePicker, InputNumber, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { useApi } from "@context/api/ApiProvider";
import { ITauxHoraire, ITypeEvenement, QK_TYPES_EVENEMENTS } from "@api";
import { createDateAsUTC, getLibellePeriode, isEnCoursSurPeriode } from "@utils/dates";
import dayjs from "dayjs";

interface ITauxHoraireFormItem {
  value?: string;
  typeEvenement?: ITypeEvenement;
  setTypeEvenementSavable?: (typeEvenementSavable: boolean) => void;
  onCancel?: () => void;
  disabled: boolean;
}

function TauxHoraireFormItem({
  value,
  typeEvenement,
  setTypeEvenementSavable,
  onCancel,
  disabled,
}: ITauxHoraireFormItem) {
  const { message } = App.useApp();
  const [editingItem, setEditingItem] = useState<ITauxHoraire | undefined>(
    value
      ? undefined
      : ({
          debut: undefined,
          fin: undefined,
          montant: "",
        } as ITauxHoraire),
  );
  const { data: dataTauxHoraire, isFetching: isFetchingTauxHoraire } = useApi().useGetItem({
    path: "/types_evenements/{typeId}/taux/{id}",
    url: value as string,
    enabled: !!value,
  });

  // Mutation d'un taux
  const patchTaux = useApi().usePatch({
    path: "/types_evenements/{typeId}/taux/{id}",
    invalidationQueryKeys: [QK_TYPES_EVENEMENTS],
    onSuccess: () => {
      message.success("Taux horaire modifié").then();
      setEditingItem(undefined);
      setTypeEvenementSavable?.(true);
    },
  });

  const postTaux = useApi().usePost({
    path: "/types_evenements/{typeId}/taux",
    invalidationQueryKeys: [QK_TYPES_EVENEMENTS],
    parameters: {
      typeId: typeEvenement?.["@id"] as string,
    },
    onSuccess: () => {
      message.success("Taux horaire sauvegardé").then();
      setEditingItem(undefined);
      setTypeEvenementSavable?.(true);
    },
  });

  const deleteTaux = useApi().useDelete({
    path: "/types_evenements/{typeId}/taux/{id}",
    invalidationQueryKeys: [QK_TYPES_EVENEMENTS],
    onSuccess: () => {
      message.success("Taux horaire supprimé").then();
      setEditingItem(undefined);
      setTypeEvenementSavable?.(true);
    },
  });

  function createOrUpdate() {
    if (!editingItem) return;
    if (!editingItem.debut) {
      message.error("Veuillez renseigner une date de début").then();
      return;
    }
    if (!editingItem.montant) {
      message.error("Veuillez renseigner un montant").then();
      return;
    }

    const data = {
      ...editingItem,
      debut: createDateAsUTC(new Date(editingItem.debut as string)).toISOString(),
      fin: editingItem.fin
        ? createDateAsUTC(new Date(editingItem.fin as string)).toISOString()
        : null,
      montant: editingItem.montant.toString(),
    };
    if (editingItem?.["@id"]) {
      patchTaux.mutate({
        "@id": editingItem["@id"] as string,
        data,
      });
    } else {
      postTaux.mutate({
        data,
      });
    }
  }

  if (editingItem) {
    return (
      <>
        <Card loading={isFetchingTauxHoraire}>
          <Card.Meta
            title={<>Édition du taux horaire</>}
            avatar={<EditOutlined />}
            description={
              <Space orientation="vertical" className="text-text">
                <Space>
                  <span>Début</span>
                  <DatePicker
                    format="DD/MM/YYYY"
                    value={editingItem?.debut ? dayjs(editingItem?.debut) : undefined}
                    onChange={(date) => {
                      setEditingItem({
                        ...editingItem,
                        debut: date?.format("YYYY-MM-DD") as string,
                      });
                    }}
                  />
                </Space>
                <Space>
                  <span>Fin</span>
                  <DatePicker
                    format="DD/MM/YYYY"
                    defaultValue={editingItem?.fin ? dayjs(editingItem?.fin) : undefined}
                    onChange={(date) => {
                      setEditingItem({
                        ...editingItem,
                        fin: date?.format("YYYY-MM-DD") as string,
                      });
                    }}
                  />
                </Space>
                <Space>
                  <span>Montant</span>
                  <Space.Compact className="w-100">
                    <InputNumber
                      min="1"
                      controls={false}
                      required
                      className="w-100"
                      decimalSeparator=","
                      defaultValue={editingItem.montant}
                      onChange={(montant) =>
                        setEditingItem({
                          ...editingItem,
                          montant: (montant || "0") as string,
                        })
                      }
                    />
                    <Button disabled className="bg-light text-dark border-left-0 px-3">
                      €
                    </Button>
                  </Space.Compact>
                </Space>
                <Space className="mt-2">
                  <Button
                    onClick={() => {
                      onCancel?.();
                      setTypeEvenementSavable?.(true);
                      setEditingItem(undefined);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => {
                      createOrUpdate();
                    }}
                  >
                    Enregistrer
                  </Button>
                </Space>
              </Space>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <Card>
        <Card.Meta
          title={
            <>
              {getLibellePeriode(dataTauxHoraire?.debut, dataTauxHoraire?.fin)}
              <Space className="float-right">
                <Popconfirm
                  title="Êtes-vous sûr de vouloir supprimer cette tarification ?"
                  onConfirm={() => {
                    deleteTaux.mutate({
                      "@id": dataTauxHoraire?.["@id"] as string,
                    });
                  }}
                  okText="Oui"
                  cancelText="Non"
                  okButtonProps={{ danger: true }}
                >
                  {dayjs(dataTauxHoraire?.debut).isAfter(new Date()) && (
                    <Button icon={<DeleteOutlined />} disabled={disabled} className="mr-1" danger />
                  )}
                </Popconfirm>

                <Button
                  icon={<EditOutlined />}
                  disabled={disabled}
                  onClick={() => {
                    setTypeEvenementSavable?.(false);
                    setEditingItem(dataTauxHoraire);
                  }}
                />
              </Space>
            </>
          }
          avatar={
            isEnCoursSurPeriode(dataTauxHoraire?.debut, dataTauxHoraire?.fin) ? (
              <Avatar size="small" className="bg-success" />
            ) : (
              <Avatar size="small" />
            )
          }
          description={
            <Space>
              <span>{dataTauxHoraire?.montant} €</span>
            </Space>
          }
        />
      </Card>
    </>
  );
}

export default TauxHoraireFormItem;
