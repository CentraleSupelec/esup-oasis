/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { IAvisEse } from "../../api/ApiTypeHelpers";
import { App, Button, Card, Col, Empty, Popconfirm, Row, Space } from "antd";
import { useApi } from "../../context/api/ApiProvider";
import { CommentOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { AvisEseAvatar } from "../Avatars/AvisEseAvatar";
import { getLibellePeriode, isEnCoursSurPeriode } from "../../utils/dates";
import { Fichier } from "../Fichier/Fichier";
import React from "react";
import { EllipsisParagraph } from "../Typography/EllipsisParagraph";
import { env } from "../../env";

export function AvisEseList(props: {
   avis: IAvisEse[];
   utilisateurId: string;
   setEditedItem: (a: IAvisEse) => void;
}) {
   const { message } = App.useApp();
   const mutateDeleteAvis = useApi().useDelete({
      path: "/utilisateurs/{uid}/avis_ese/{id}",
      invalidationQueryKeys: [
         "/utilisateurs/{uid}/avis_ese",
         "/beneficiaires",
         props.utilisateurId,
      ],
      onSuccess: () => {
         message.success(`Avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"} supprimé`).then();
      },
   });

   return (
      <>
         {props.avis.length === 0 && (
            <div>
               <Empty
                  description={`Aucun avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"}`}
                  className="m-auto mt-2 mb-2"
               />
            </div>
         )}
         <Row gutter={[16, 16]}>
            {props.avis.map((a) => (
               <Col key={a["@id"]} xs={24} sm={24} md={24} lg={12} xl={8}>
                  <Card
                     style={{
                        borderColor: "#e0e0e0",
                     }}
                     className={isEnCoursSurPeriode(a.debut, a.fin) ? "" : "avisese-non-en-cours"}
                     styles={{ body: { minHeight: 200 } }}
                     actions={[
                        <Button
                           key="edit"
                           type="link"
                           icon={<EditOutlined />}
                           onClick={() => {
                              props.setEditedItem(a);
                           }}
                        >
                           Éditer
                        </Button>,
                        <Popconfirm
                           key="delete"
                           title="Supprimer l'avis ESE ?"
                           onConfirm={() => {
                              mutateDeleteAvis.mutate({
                                 "@id": a["@id"] as string,
                              });
                           }}
                        >
                           <Button key="delete" type="link" danger icon={<DeleteOutlined />}>
                              Supprimer
                           </Button>
                        </Popconfirm>,
                     ]}
                  >
                     <Card.Meta
                        avatar={<AvisEseAvatar avis={a} size="small" />}
                        title={
                           <h4 className="mt-0 mb-0 fs-12">
                              {a.libelle || `Avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"}`}
                           </h4>
                        }
                        description={
                           <Space orientation="vertical" className="text-text w-100">
                              {getLibellePeriode(a.debut, a.fin)}
                              {a.commentaire && a.commentaire.length > 0 && (
                                 <Space align="start" size={12}>
                                    <CommentOutlined />
                                    <EllipsisParagraph
                                       className="light mb-0"
                                       content={a.commentaire}
                                       type="secondary"
                                    />
                                 </Space>
                              )}
                              {a.fichier && <Fichier fichierId={a.fichier} hideDownload />}
                           </Space>
                        }
                     />
                  </Card>
               </Col>
            ))}
         </Row>
      </>
   );
}
