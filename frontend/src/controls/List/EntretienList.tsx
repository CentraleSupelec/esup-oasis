/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { IEntretien } from "../../api/ApiTypeHelpers";
import { App, Button, Card, Col, Empty, Popconfirm, Row, Space } from "antd";
import { useApi } from "../../context/api/ApiProvider";
import { CalendarOutlined, CommentOutlined, DeleteOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import { Fichier } from "../Fichier/Fichier";
import React from "react";
import dayjs from "dayjs";
import GestionnaireItem from "../Items/GestionnaireItem";

// import relativeTime plugin
import relativeTime from "dayjs/plugin/relativeTime";
import { EllipsisParagraph } from "../Typography/EllipsisParagraph";

// extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

export function EntretienList(props: {
   entretiens: IEntretien[];
   utilisateurId: string;
   setEditedItem: (a: IEntretien) => void;
}) {
   const { message } = App.useApp();
   const mutateDeleteEntretien = useApi().useDelete({
      path: "/utilisateurs/{uid}/entretiens/{id}",
      invalidationQueryKeys: ["/utilisateurs/{uid}/entretiens"],
      onSuccess: () => {
         message.success("Entretien supprimé").then();
      },
   });

   return (
      <>
         {props.entretiens.length === 0 && (
            <div>
               <Empty description="Aucun entretien" className="m-auto mt-2 mb-2" />
            </div>
         )}
         <Row gutter={[16, 16]}>
            {props.entretiens.map((entretien) => (
               <Col key={entretien["@id"]} xs={24} sm={24} md={24} lg={12} xl={8}>
                  <Card
                     style={{ borderColor: "#e0e0e0" }}
                     styles={{ body: { minHeight: 190 } }}
                     actions={[
                        <Button
                           key="edit"
                           type="link"
                           icon={<EditOutlined />}
                           onClick={() => {
                              props.setEditedItem(entretien);
                           }}
                        >
                           Éditer
                        </Button>,
                        <Popconfirm
                           key="delete"
                           title={"Supprimer l'entretien ?"}
                           onConfirm={() => {
                              mutateDeleteEntretien.mutate({
                                 "@id": entretien["@id"] as string,
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
                        //    avatar={<CalendarOutlined style={{ fontSize: 18, marginTop: 4 }} />}
                        title={
                           <h4 className="mt-0 mb-0 fs-11">
                              <CalendarOutlined
                                 className="mr-1"
                                 style={{ fontSize: 18, marginTop: 4 }}
                              />
                              {dayjs(entretien.date).format("DD MMM YYYY")}
                              <span className="ml-1 legende">
                                 {dayjs(entretien.date).fromNow()}
                              </span>
                           </h4>
                        }
                        description={
                           <Space size={4} orientation="vertical" className="text-text w-100">
                              {entretien.commentaire && entretien.commentaire.length > 0 && (
                                 <Space align="start" size={12}>
                                    <CommentOutlined aria-hidden />
                                    <EllipsisParagraph
                                       content={entretien.commentaire}
                                       type="secondary"
                                       className="light mb-0"
                                    />
                                 </Space>
                              )}
                              {entretien.fichier && (
                                 <Fichier fichierId={entretien.fichier} hideDownload />
                              )}
                              {entretien.gestionnaire && (
                                 <Space align="start" size={12}>
                                    <UserOutlined aria-hidden />
                                    <GestionnaireItem
                                       showAvatar={false}
                                       gestionnaireId={entretien.gestionnaire}
                                    />
                                 </Space>
                              )}
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
