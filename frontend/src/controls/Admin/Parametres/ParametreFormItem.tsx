/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useState } from "react";
import { useApi } from "../../../context/api/ApiProvider";
import { App, Avatar, Button, Card, DatePicker, Input, Space } from "antd";
import { createDateAsUTC, getLibellePeriode, isEnCoursSurPeriode } from "../../../utils/dates";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { IParametre, IParametreValeur } from "../../../api/ApiTypeHelpers";
import dayjs from "dayjs";
import { Fichier } from "../../Fichier/Fichier";
import { FichierDepot } from "../../Fichier/FichierDepot";

interface ParametreFormItemProps {
   value?: string;
   onCancel?: () => void;
   parametre?: IParametre;
}

function ParametreFormItemString(props: {
   valeur?: IParametreValeur;
   editingItem: IParametreValeur | undefined;
   setEditingItem: (value: IParametreValeur | undefined) => void;
   onSubmit?: () => void;
   onCancel?: () => void;
}) {
   if (props.editingItem) {
      return (
         <Card className="mb-2">
            <Card.Meta
               title={<>Édition de la valeur du paramètre</>}
               avatar={<EditOutlined />}
               description={
                  <Space orientation="vertical" className="text-text">
                     <Space>
                        <span>Début</span>
                        <DatePicker
                           format="DD/MM/YYYY"
                           value={
                              props.editingItem?.debut ? dayjs(props.editingItem?.debut) : undefined
                           }
                           onChange={(date) => {
                              props.setEditingItem({
                                 ...props.editingItem,
                                 debut: date?.format("YYYY-MM-DD") as string,
                              });
                           }}
                        />
                     </Space>
                     <Space>
                        <span>Fin</span>
                        <DatePicker
                           format="DD/MM/YYYY"
                           defaultValue={
                              props.editingItem?.fin ? dayjs(props.editingItem?.fin) : undefined
                           }
                           onChange={(date) => {
                              props.setEditingItem({
                                 ...props.editingItem,
                                 debut: props.editingItem?.debut as string,
                                 fin: date?.format("YYYY-MM-DD") as string,
                              });
                           }}
                        />
                     </Space>
                     <Space>
                        <span>Valeur du paramètre</span>
                        <Input
                           required
                           defaultValue={props.editingItem.valeur ?? undefined}
                           onChange={(v) =>
                              props.setEditingItem({
                                 ...props.editingItem,
                                 debut: props.editingItem?.debut as string,
                                 valeur: (v.currentTarget.value || "") as string,
                              })
                           }
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
      <>
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
                  <Space>
                     <span>Valeur sur la période :</span>
                     <span className="code">{props.valeur?.valeur}</span>
                  </Space>
               }
            />
         </Card>
      </>
   );
}

function ParametreFormItemFichier(props: {
   valeur?: IParametreValeur;
   editingItem: IParametreValeur | undefined;
   setEditingItem: (value: IParametreValeur | undefined) => void;
   onSubmit?: () => void;
   onCancel?: () => void;
}) {
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
                           value={
                              props.editingItem?.debut ? dayjs(props.editingItem?.debut) : undefined
                           }
                           onChange={(date) => {
                              props.setEditingItem({
                                 ...props.editingItem,
                                 debut: date?.format("YYYY-MM-DD") as string,
                              });
                           }}
                        />
                     </Space>
                     <Space>
                        <span>Fin</span>
                        <DatePicker
                           format="DD/MM/YYYY"
                           defaultValue={
                              props.editingItem?.fin ? dayjs(props.editingItem?.fin) : undefined
                           }
                           onChange={(date) => {
                              props.setEditingItem({
                                 ...props.editingItem,
                                 debut: props.editingItem?.debut as string,
                                 fin: date?.format("YYYY-MM-DD") as string,
                              });
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
                              });
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
      <>
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
      </>
   );
}

/**
 * Function to render a form item for parameter values.
 *
 * @param {Object} options - The options object.
 * @param {Object} [options.value] - The value of the form item.
 * @param {Function} [options.onCancel] - The cancel function to be called when editing is canceled.
 * @param {Object} [options.parametre] - The parameter object.
 *
 * @return {ReactElement} - The rendered form item component.
 */
export default function ParametreFormItem({
   value,
   onCancel,
   parametre,
}: ParametreFormItemProps): ReactElement {
   const { message } = App.useApp();
   const [editingItem, setEditingItem] = useState<IParametreValeur | undefined>(
      value
         ? undefined
         : {
              debut: "",
              fin: undefined,
              valeur: "",
           },
   );
   const { data: valeur, isFetching: isFetchingValeur } = useApi().useGetItem({
      path: "/parametres/{cle}/valeurs/{id}",
      url: value as string,
      enabled: !!value,
   });

   // Mutation d'une valeur
   const patchValeur = useApi().usePatch({
      path: "/parametres/{cle}/valeurs/{id}",
      invalidationQueryKeys: ["/parametres"],
      onSuccess: () => {
         message.success("Valeur du paramètre modifiée").then();
         setEditingItem(undefined);
      },
   });

   const postValeur = useApi().usePost({
      path: "/parametres/{cle}/valeurs",
      invalidationQueryKeys: ["/parametres"],
      parameters: {
         cle: `/parametres/${parametre?.["@id"]?.split("/")[2]}`,
      },
      onSuccess: () => {
         message.success("Valeur du paramètre sauvegardée").then();
         setEditingItem(undefined);
      },
   });

   function createOrUpdate() {
      if (!editingItem) return;
      if (!editingItem.debut) {
         message.error("Veuillez renseigner une date de début").then();
         return;
      }
      if (!parametre?.fichier && !editingItem.valeur) {
         message.error("Veuillez renseigner une valeur").then();
         return;
      }
      if (parametre?.fichier && !editingItem.fichier) {
         message.error("Veuillez déposer un fichier").then();
         return;
      }

      const data = {
         ...editingItem,
         debut: createDateAsUTC(new Date(editingItem.debut as string)).toISOString(),
         fin: editingItem.fin
            ? createDateAsUTC(new Date(editingItem.fin as string)).toISOString()
            : null,
         valeur: parametre?.fichier ? undefined : editingItem.valeur,
         fichier: parametre?.fichier ? editingItem.fichier : undefined,
      };
      if (editingItem?.["@id"]) {
         patchValeur.mutate({
            "@id": editingItem["@id"] as string,
            data,
         });
      } else {
         postValeur.mutate({
            data,
         });
      }
   }

   if (isFetchingValeur) {
      return <Card className="mb-2" loading />;
   }

   return parametre?.fichier ? (
      <ParametreFormItemFichier
         valeur={valeur}
         editingItem={editingItem}
         setEditingItem={setEditingItem}
         onCancel={onCancel}
         onSubmit={createOrUpdate}
      />
   ) : (
      <ParametreFormItemString
         valeur={valeur}
         editingItem={editingItem}
         setEditingItem={setEditingItem}
         onCancel={onCancel}
         onSubmit={createOrUpdate}
      />
   );
}
