/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { Alert, App, Button, Empty, Flex, List, Popconfirm, Tooltip } from "antd";
import {
   DeleteOutlined,
   FilterOutlined,
   SaveOutlined,
   StarFilled,
   StarOutlined,
} from "@ant-design/icons";
import React from "react";
import FiltreDescription, { FiltreDecrivable } from "./FiltreDescription";
import { usePreferences } from "../../context/utilisateurPreferences/UtilisateurPreferencesProvider";

import { UseStateDispatch } from "../../utils/utils";

export function FiltresFavoris(props: {
   filtre: FiltreDecrivable;
   setFiltre: UseStateDispatch<FiltreDecrivable>;
   filtreType: string;
   defaultFilter: FiltreDecrivable;
}) {
   const { message } = App.useApp();
   const { getPreferenceArray, setPreferenceArray } = usePreferences();

   return (
      <>
         <Alert
            type="info"
            className="mb-2"
            showIcon
            title="Enregistrement des filtres"
            description={
               <>
                  Pour retrouver rapidement vos informations, vous pouvez enregistrer des filtres de
                  recherche.
                  <br />
                  <br />
                  Pour <b>sauvegarder un nouveau filtre</b>, utilisez les filtres ci-dessus puis
                  cliquez sur le bouton "Enregistrer le filtre" une fois que vous avez défini vos
                  critères. Vous pourrez alors l'appliquer lorsque vous en aurez besoin en cliquant
                  sur le bouton "Filtrer".
                  <br />
                  Vous pouvez également définir un <b>filtre favori</b> en cliquant sur{" "}
                  <StarOutlined />. Ce filtre sera appliqué par défaut lorsque vous accéderez à
                  cette page.
                  <br />
                  <br />
                  Ces filtres sont personnels, ils ne sont pas partagés avec les autres
                  utilisateurs.
               </>
            }
         />
         <List
            size="small"
            header={
               <Flex justify="space-between" align="center">
                  <span className="semi-bold">Filtres sauvegardés</span>
                  <Tooltip title="Enregistrer le filtre courant">
                     <Button
                        type="primary"
                        icon={<SaveOutlined aria-hidden />}
                        onClick={() => {
                           const nom = prompt("Nom du filtre:", "Nouveau filtre");
                           const hasSameName = getPreferenceArray(props.filtreType).some(
                              (f) => f.nom === nom,
                           );
                           if (hasSameName) {
                              message.error("Un filtre enregistré porte déjà ce nom").then();
                              return;
                           }

                           if (nom) {
                              setPreferenceArray(props.filtreType, [
                                 ...getPreferenceArray(props.filtreType),
                                 { filtre: { ...props.filtre, page: 1 }, nom, favori: false },
                              ]);
                              message.success("Filtre enregistré").then();
                           }
                        }}
                     >
                        Enregistrer le filtre
                     </Button>
                  </Tooltip>
               </Flex>
            }
            bordered
         >
            {getPreferenceArray(props.filtreType)
               ?.sort((f1, f2) => f1.nom.localeCompare(f2.nom))
               .map((filtre) => (
                  <List.Item
                     key={filtre.nom}
                     extra={
                        <Button.Group>
                           <Button
                              icon={<FilterOutlined />}
                              onClick={() => {
                                 props.setFiltre({ ...filtre.filtre, page: 1 });
                                 message.info(`Filtre "${filtre.nom}" appliqué`).then();
                              }}
                           >
                              Filtrer
                           </Button>
                           <Tooltip
                              placement="left"
                              title={
                                 filtre.favori
                                    ? "Retirer le filtre favori"
                                    : "Définir comme filtre favori"
                              }
                           >
                              <Button
                                 icon={
                                    filtre.favori ? (
                                       <StarFilled className="text-app-dark" />
                                    ) : (
                                       <StarOutlined />
                                    )
                                 }
                                 onClick={() => {
                                    setPreferenceArray(
                                       props.filtreType,
                                       getPreferenceArray(props.filtreType).map((f) => {
                                          // un seul filtre peut être favori
                                          if (!f.favori && f.nom !== filtre.nom) {
                                             return { ...f, favori: false };
                                          }
                                          return { ...f, favori: !f.favori };
                                       }) || [],
                                    );
                                 }}
                              />
                           </Tooltip>
                           <FiltreDescription filtre={filtre.filtre} as="modal" />
                           <Popconfirm
                              title={`Supprimer le filtre "${filtre.nom}" ?`}
                              onConfirm={() => {
                                 setPreferenceArray(
                                    props.filtreType,
                                    getPreferenceArray(props.filtreType).filter(
                                       (f) => f.nom !== filtre.nom,
                                    ) || [],
                                 );
                                 message.success("Filtre supprimé").then();
                              }}
                           >
                              <Button icon={<DeleteOutlined />} className="text-danger" />
                           </Popconfirm>
                        </Button.Group>
                     }
                  >
                     {filtre.nom}
                  </List.Item>
               ))}
            {getPreferenceArray(props.filtreType).length === 0 && (
               <List.Item>
                  <Empty className="m-auto mt-1 mb-1" description="Aucun filtre enregistré" />
               </List.Item>
            )}
         </List>
      </>
   );
}
