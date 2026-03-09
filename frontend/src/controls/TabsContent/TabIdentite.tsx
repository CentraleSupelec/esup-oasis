/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect } from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useApi } from "../../context/api/ApiProvider";
import {
   App,
   Col,
   Descriptions,
   Flex,
   Form,
   Input,
   Row,
   Skeleton,
   Space,
   Tooltip,
   Typography,
} from "antd";
import { InfoCircleOutlined, LockOutlined, MinusOutlined, UserOutlined } from "@ant-design/icons";
import { ScolariteListItem } from "./TabScolarite";
import { TabProfils } from "./TabProfils";
import UtilisateurEmailItem from "../Items/UtilisateurEmailItem";
import { MailSmallButton } from "../Forms/UtilisateurFormItemSelect";
import { GenreItem } from "../Items/GenreItem";
import dayjs from "dayjs";
import { calculerAge } from "../../utils/dates";
import { useAuth } from "../../auth/AuthProvider";
import UtilisateurAvatarImage from "../Avatars/UtilisateurAvatarImage";
import { RoleValues } from "../../lib/Utilisateur";
import { env } from "../../env";

export function TabIdentite(props: {
   utilisateurId: string;
   demandeId?: string;
}): React.ReactElement {
   const screens = useBreakpoint();
   const { message } = App.useApp();
   const [form] = Form.useForm();
   const user = useAuth().user;
   const [commentaire, setCommentaire] = React.useState<string>();

   const { data: utilisateur, isFetching } = useApi().useGetItem({
      path: "/utilisateurs/{uid}",
      url: props.utilisateurId,
      enabled: !!props.utilisateurId,
   });

   const { data: demande } = useApi().useGetItem({
      path: "/demandes/{id}",
      url: props.demandeId,
      enabled: !!props.demandeId,
   });

   const mutateDemande = useApi().usePatch({
      path: "/demandes/{id}",
      invalidationQueryKeys: [props.demandeId as string],
      onSuccess: () => {
         message.success("Commentaire enregistré").then();
      },
   });

   const mutateUtilisateur = useApi().usePatch({
      path: "/utilisateurs/{uid}",
      invalidationQueryKeys: ["utilisateurs", utilisateur?.["@id"] || "/utilisateurs"],
      onSuccess: () => message.success("Utilisateur modifié").then(),
   });

   useEffect(() => {
      form.setFieldsValue(utilisateur);
   }, [form, utilisateur]);

   useEffect(() => {
      setCommentaire(demande?.commentaire || "");
   }, [demande]);

   if (!utilisateur) {
      return (
         <Form form={form}>
            <Skeleton active paragraph />
         </Form>
      );
   }

   return (
      <div>
         <h2 className="sr-only">Identité</h2>
         <Row
            gutter={16}
            className={screens.xl ? "" : "d-flex-column-reverse"}
            style={{ alignItems: "center" }}
         >
            <Col xs={24} xl={18}>
               {isFetching ? (
                  <Skeleton active paragraph />
               ) : (
                  <>
                     <h2>Identité</h2>
                     <Descriptions bordered column={screens.xl ? 2 : 1}>
                        <Descriptions.Item label="Nom" span={1}>
                           <span className="semi-bold text-primary">
                              {utilisateur.nom?.toLocaleUpperCase()}
                           </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Prénom" span={1}>
                           <span className="semi-bold text-primary">{utilisateur.prenom}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Genre">
                           <GenreItem genre={utilisateur.genre} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Date de naissance">
                           {utilisateur.dateNaissance ? (
                              <Space>
                                 <span>
                                    {dayjs(utilisateur.dateNaissance).format("DD/MM/YYYY")}
                                 </span>
                                 <span className="semi-bold">
                                    ({calculerAge(utilisateur.dateNaissance)} ans)
                                 </span>
                              </Space>
                           ) : (
                              <MinusOutlined />
                           )}
                        </Descriptions.Item>
                        <Descriptions.Item
                           span={user?.isGestionnaire ? 1 : 2}
                           label="Email institutionnel"
                        >
                           {utilisateur?.email ? (
                              <Space>
                                 <UtilisateurEmailItem
                                    utilisateur={utilisateur}
                                    emailPerso={false}
                                 />
                                 <MailSmallButton
                                    utilisateur={utilisateur}
                                    className="text-primary"
                                 />
                              </Space>
                           ) : (
                              <MinusOutlined />
                           )}
                        </Descriptions.Item>
                        {user?.isGestionnaire && (
                           <Descriptions.Item label="Contact en cas d'urgence">
                              <Typography.Text
                                 style={{ whiteSpace: "pre-wrap" }}
                                 editable={{
                                    text: utilisateur?.contactUrgence ?? undefined,
                                    onChange: (value) =>
                                       mutateUtilisateur.mutate({
                                          data: {
                                             contactUrgence: value,
                                          },
                                          "@id": props.utilisateurId,
                                       }),
                                 }}
                              >
                                 {utilisateur?.contactUrgence || <MinusOutlined />}
                              </Typography.Text>
                           </Descriptions.Item>
                        )}
                        {user?.isGestionnaire && (
                           <Descriptions.Item label="Email personnel">
                              {utilisateur?.emailPerso ? (
                                 <Space>
                                    <UtilisateurEmailItem utilisateur={utilisateur} emailPerso />
                                    <MailSmallButton
                                       utilisateur={utilisateur}
                                       emailPerso
                                       className="text-primary"
                                    />
                                 </Space>
                              ) : (
                                 <MinusOutlined />
                              )}
                           </Descriptions.Item>
                        )}
                        {user?.isGestionnaire && (
                           <Descriptions.Item label="Téléphone personnel">
                              <Typography.Text
                                 editable={{
                                    text: utilisateur?.telPerso ?? undefined,
                                    onChange: (value) =>
                                       mutateUtilisateur.mutate({
                                          data: {
                                             telPerso: value,
                                          },
                                          "@id": props.utilisateurId,
                                       }),
                                 }}
                              >
                                 {utilisateur?.telPerso || <MinusOutlined />}
                              </Typography.Text>
                           </Descriptions.Item>
                        )}
                     </Descriptions>
                  </>
               )}
            </Col>
            <Col xs={24} xl={6} className="d-flex-center">
               <UtilisateurAvatarImage
                  utilisateurId={utilisateur["@id"] as string}
                  as="img"
                  height={250}
                  style={{ fontSize: 128 }}
                  className={`border-0 mt-3 ${screens.xl ? "" : "mb-3"}`}
                  fallback={<UserOutlined />}
                  desactiverLazyLoading
               />
            </Col>
         </Row>
         <Row gutter={16}>
            <Col xs={24} xl={12}>
               <h2>Scolarité</h2>
               {isFetching ? (
                  <Skeleton active paragraph />
               ) : (
                  <Descriptions bordered column={1} style={{ overflowX: "auto" }}>
                     <Descriptions.Item label="Numéro étudiant">
                        <Typography.Text copyable={utilisateur.numeroEtudiant !== undefined}>
                           {utilisateur.numeroEtudiant || <MinusOutlined />}
                        </Typography.Text>
                     </Descriptions.Item>
                     <Descriptions.Item label="Régime d'inscription">
                        {utilisateur?.statutEtudiant}
                     </Descriptions.Item>
                     <Descriptions.Item label="Inscriptions" styles={{ label: { width: 200 } }}>
                        <h3 className="sr-only">Inscriptions</h3>
                        <Flex vertical style={{ width: "100%", overflowY: "auto" }} wrap="wrap">
                           {utilisateur.inscriptions
                              ?.sort((i1, i2) => (i2.debut || "").localeCompare(i1.debut || ""))
                              .map((i) => (
                                 <ScolariteListItem
                                    key={i["@id"]}
                                    inscription={i}
                                    titleClassName=""
                                 />
                              ))}
                        </Flex>
                     </Descriptions.Item>
                  </Descriptions>
               )}
            </Col>
            {user?.isGestionnaire && (
               <Col xs={24} xl={12}>
                  <h2>Suivi {env.REACT_APP_SERVICE}</h2>
                  {isFetching ? (
                     <Skeleton active paragraph />
                  ) : (
                     <Descriptions bordered column={1} style={{ overflowX: "auto" }}>
                        {utilisateur.roles?.includes(RoleValues.ROLE_BENEFICIAIRE) && (
                           <Descriptions.Item
                              label={
                                 <Flex className="w-100" justify="space-between">
                                    <div>
                                       <LockOutlined className="mr-1" />
                                       <span>Numéro d'anonymat</span>
                                    </div>
                                    <Tooltip title="Utilisé pour les rapports ministériels, il ne peut pas être modifié une fois saisi">
                                       <InfoCircleOutlined className="text-legende" />
                                    </Tooltip>
                                 </Flex>
                              }
                           >
                              <Typography.Text
                                 editable={
                                    utilisateur.numeroAnonyme
                                       ? false
                                       : {
                                            onChange: (value) => {
                                               // value doit être un nombre de 8 chiffres
                                               if (value && !/^\d{8}$/.test(value)) {
                                                  message
                                                     .error(
                                                        "Le numéro d'anonymat doit être composé de 8 chiffres",
                                                     )
                                                     .then();
                                                  return;
                                               }

                                               mutateUtilisateur.mutate({
                                                  data: {
                                                     numeroAnonyme: parseInt(value),
                                                  },
                                                  "@id": props.utilisateurId,
                                               });
                                            },
                                         }
                                 }
                                 copyable={
                                    utilisateur.numeroAnonyme
                                       ? { text: utilisateur.numeroAnonyme.toString() }
                                       : false
                                 }
                              >
                                 {utilisateur.numeroAnonyme ? (
                                    <span className="code fs-09">{utilisateur.numeroAnonyme}</span>
                                 ) : (
                                    <MinusOutlined />
                                 )}
                              </Typography.Text>
                           </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Profils">
                           {(utilisateur?.profils || []).length === 0 && (
                              <Descriptions.Item label="Profils">
                                 Aucun profil actuellement
                              </Descriptions.Item>
                           )}
                           <Form form={form} initialValues={utilisateur} className="mt-1">
                              <TabProfils utilisateur={utilisateur} />
                           </Form>
                        </Descriptions.Item>
                     </Descriptions>
                  )}
               </Col>
            )}
         </Row>
         {props.demandeId && user?.isGestionnaire && (
            <Row gutter={16}>
               <Col xs={24} xl={24}>
                  <h2>Commentaire sur la demande</h2>
                  {isFetching ? (
                     <Skeleton active paragraph />
                  ) : (
                     <Descriptions bordered>
                        <Descriptions.Item
                           label={
                              <>
                                 Commentaire
                                 <div className="legende">Visible CAS uniquement</div>
                              </>
                           }
                        >
                           <Input.TextArea
                              autoSize={{ minRows: 3 }}
                              value={commentaire}
                              onChange={(e) => setCommentaire(e.target.value)}
                              onBlur={() =>
                                 mutateDemande.mutate({
                                    data: {
                                       commentaire: commentaire,
                                    },
                                    "@id": props.demandeId as string,
                                 })
                              }
                           />
                        </Descriptions.Item>
                     </Descriptions>
                  )}
               </Col>
            </Row>
         )}
      </div>
   );
}
