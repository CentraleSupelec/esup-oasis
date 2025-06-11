/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Alert, Avatar, Button, Card, Col, Flex, Row, Tooltip, Typography } from "antd";
import "../../routes/gestionnaire/dashboard/Dashboard.scss";
import { useNavigate } from "react-router-dom";
import { AffectationFilterValues } from "../Filters/Affectation/AffectationFilter";
import { useApi } from "../../context/api/ApiProvider";
import { useDispatch } from "react-redux";
import { setAffichageFiltres } from "../../redux/actions/AffichageFiltre";
import { TypeAffichageValues } from "../../redux/context/IAffichageFiltres";
import { PREFETCH_ETAT_DEMANDE, PREFETCH_TYPES_EVENEMENTS } from "../../api/ApiPrefetchHelpers";
import StatisticProgress from "./StatisticProgress";
import Statistic from "./Statistic";
import { DownOutlined, EyeOutlined, WarningFilled } from "@ant-design/icons";
import { pluriel } from "../../utils/string";
import { useAuth } from "../../auth/AuthProvider";
import MonoStackedBar from "./MonoStackedBar/MonoStackedBar";
import { getEtatDemandeInfo } from "../../lib/demande";
import { EtatDecisionEtablissement } from "../Avatars/DecisionEtablissementAvatar";
import { EtatAvisEse } from "../Avatars/BeneficiaireAvisEseAvatar";
import { BENEFICIAIRE_PROFIL_A_DETERMINER } from "../../constants";
import { env } from "../../env";

interface IDashboardUtilisateurProps {
   utilisateurId: string;
}

/**
 * Render a user dashboard with stats
 * @param {object} props - The props object
 * @param {number} props.utilisateurId - The user ID
 * @returns {ReactElement} - The rendered dashboard component
 */
export default function DashboardUtilisateurStats({
   utilisateurId,
}: IDashboardUtilisateurProps): ReactElement {
   const user = useAuth().user;
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const [showDemandeDetails, setShowDemandeDetails] = React.useState<boolean>(false);
   const { data: typesEvenements } = useApi().useGetCollection(PREFETCH_TYPES_EVENEMENTS);
   const { data: etatsDemande } = useApi().useGetCollection(PREFETCH_ETAT_DEMANDE);
   const { data: stats, isFetching } = useApi().useGetItem({
      path: "/statistiques",
      url: "/statistiques",
      query: {
         utilisateur: utilisateurId,
      },
      enabled: !!utilisateurId,
   });

   function goToCalendar(type: TypeAffichageValues, affecte: AffectationFilterValues) {
      dispatch(
         setAffichageFiltres(
            {
               type,
            },
            {
               debut: new Date(),
               fin: new Date(),
               "exists[intervenant]": affecte,
               type:
                  affecte === AffectationFilterValues.NonAffectes
                     ? typesEvenements?.items.map((t) => t["@id"] as string)
                     : undefined,
            },
         ),
      );
      navigate(`/planning/calendrier`);
   }

   return (
      <>
         {user?.isGestionnaire && (stats?.evenementsSansBeneficiaire || 0) > 0 && (
            <Alert
               type="error"
               showIcon
               icon={<WarningFilled />}
               message="Évènement sans bénéficiaire détecté !"
               description={`Corrigez cette situation avant l'envoi de la période à la RH.`}
               action={
                  <Button
                     ghost
                     danger
                     icon={<EyeOutlined />}
                     onClick={() => {
                        navigate("/planning/evenements-sans-beneficiaires");
                     }}
                  >
                     Consulter les évènements
                  </Button>
               }
            />
         )}
         <Row>
            {user?.isGestionnaire && (
               <Col span={24}>
                  <Typography.Title level={2}>Activité du service</Typography.Title>
                  <Row gutter={[16, 16]}>
                     <Col xl={8} lg={12} xs={24} sm={12}>
                        <Card
                           className="pointer ant-card-stats-numeric ant-card-stats-hoverable"
                           variant={"borderless"}
                           onClick={() => {
                              navigate(`/beneficiaires`);
                           }}
                        >
                           <Statistic
                              title={pluriel(
                                 stats?.nbBeneficiaires || 0,
                                 "Bénéficiaire",
                                 "Bénéficiaires",
                              )}
                              value={stats?.nbBeneficiaires || 0}
                              precision={0}
                              isFetching={isFetching}
                              prefix={
                                 stats?.nbBeneficiairesIncomplets &&
                                 stats?.nbBeneficiairesIncomplets > 0 ? (
                                    <Tooltip
                                       title={`${stats?.nbBeneficiairesIncomplets} ${pluriel(
                                          stats?.nbBeneficiairesIncomplets,
                                          "profil",
                                          "profils",
                                       )} à renseigner`}
                                    >
                                       <WarningFilled className="text-warning mr-1" />
                                    </Tooltip>
                                 ) : undefined
                              }
                           />
                        </Card>
                     </Col>
                     <Col xl={8} lg={12} xs={24} sm={12}>
                        <Card
                           className="pointer ant-card-stats-numeric ant-card-stats-hoverable"
                           variant={"borderless"}
                           onClick={() => {
                              navigate(`/amenagements?mode=beneficiaire`);
                           }}
                        >
                           <Statistic
                              title={pluriel(
                                 stats?.nbAmenagementsEnCours || 0,
                                 "Aménagement",
                                 "Aménagements",
                              )}
                              value={stats?.nbAmenagementsEnCours || 0}
                              precision={0}
                              isFetching={isFetching}
                           />
                        </Card>
                     </Col>
                     <Col xl={8} lg={12} xs={24} sm={12}>
                        <Card
                           className="pointer ant-card-stats-numeric ant-card-stats-hoverable"
                           variant={"borderless"}
                           onClick={() => {
                              navigate(`/intervenants`);
                           }}
                        >
                           <Statistic
                              title={pluriel(
                                 stats?.nbIntervenants || 0,
                                 "Intervenant",
                                 "Intervenants",
                              )}
                              value={stats?.nbIntervenants || 0}
                              precision={0}
                              isFetching={isFetching}
                           />
                        </Card>
                     </Col>
                  </Row>
                  {user?.isGestionnaire && (
                     <div className="stats-subrow-wrapper appear-down">
                        <div className="stats-subrow">
                           <Row gutter={[16, 16]}>
                              <Col xl={8} lg={12} xs={24} sm={12}>
                                 <Card
                                    className="pointer ant-card-stats-numeric ant-card-stats-hoverable"
                                    variant={"borderless"}
                                    onClick={() => {
                                       navigate(
                                          `/beneficiaires?filtreType=profil&filtreValeur=${
                                             BENEFICIAIRE_PROFIL_A_DETERMINER
                                          }`,
                                       );
                                    }}
                                 >
                                    <Statistic
                                       title={pluriel(
                                          stats?.nbBeneficiairesIncomplets || 0,
                                          "Profil à renseigner",
                                          "Profils à renseigner",
                                       )}
                                       value={stats?.nbBeneficiairesIncomplets || 0}
                                       precision={0}
                                       isFetching={isFetching}
                                    />
                                 </Card>
                              </Col>
                              <Col xl={8} lg={12} xs={24} sm={12}>
                                 <Card
                                    className="pointer ant-card-stats-numeric ant-card-stats-hoverable"
                                    variant={"borderless"}
                                    onClick={() => {
                                       navigate(
                                          `/beneficiaires?filtreType=etatAvisEse&filtreValeur=${
                                             EtatAvisEse.ETAT_EN_ATTENTE
                                          }`,
                                       );
                                    }}
                                 >
                                    <Statistic
                                       title={`Avis ${env.REACT_APP_ESPACE_SANTE_ABV || "santé"} en attente`}
                                       value={stats?.nbAvisEseEnAttente || 0}
                                       precision={0}
                                       isFetching={isFetching}
                                    />
                                 </Card>
                              </Col>
                              <Col xl={8} lg={12} xs={24} sm={12}>
                                 <Card
                                    className="pointer ant-card-stats-numeric ant-card-stats-hoverable"
                                    variant={"borderless"}
                                    onClick={() => {
                                       navigate(
                                          `/beneficiaires?filtreType=etatDecisionAmenagement&filtreValeur=${
                                             user?.isAdmin
                                                ? EtatDecisionEtablissement.VALIDE
                                                : EtatDecisionEtablissement.ATTENTE_VALIDATION_CAS
                                          }`,
                                       );
                                    }}
                                 >
                                    <Statistic
                                       title={
                                          user?.isAdmin
                                             ? pluriel(
                                                  (user?.isAdmin
                                                     ? stats?.nbDecisionsAEditer
                                                     : stats?.nbDecisionsAttenteValidation) || 0,
                                                  "Décision à éditer",
                                                  "Décisions à éditer",
                                               )
                                             : pluriel(
                                                  (user?.isAdmin
                                                     ? stats?.nbDecisionsAEditer
                                                     : stats?.nbDecisionsAttenteValidation) || 0,
                                                  "Décision à valider",
                                                  "Décisions à valider",
                                               )
                                       }
                                       value={
                                          (user?.isAdmin
                                             ? stats?.nbDecisionsAEditer
                                             : stats?.nbDecisionsAttenteValidation) || 0
                                       }
                                       precision={0}
                                       isFetching={isFetching}
                                    />
                                 </Card>
                              </Col>
                           </Row>
                        </div>
                     </div>
                  )}
               </Col>
            )}

            <Col span={24}>
               <Typography.Title level={2}>Demandes d'accompagnement</Typography.Title>
               <Row gutter={[16, 16]}>
                  <Col xl={6} lg={12} xs={24} sm={12}>
                     <Card
                        className="pointer ant-card-stats-numeric ant-card-stats-hoverable"
                        variant={"borderless"}
                        onClick={() => {
                           navigate(`/demandeurs`);
                        }}
                     >
                        <Statistic
                           title={pluriel(stats?.nbDemandesEnCours || 0, "Demande", "Demandes")}
                           value={stats?.nbDemandesEnCours || 0}
                           precision={0}
                           isFetching={isFetching}
                        />
                     </Card>
                  </Col>
               </Row>
               {(stats?.nbDemandesEnCours || 0) > 0 && (
                  <div className="stats-subrow-wrapper appear-down">
                     <div className="stats-subrow">
                        <Flex align="center" wrap={false} className="w-100">
                           <div className="ml-1" style={{ flexGrow: 1 }}>
                              <MonoStackedBar
                                 onClick={() => setShowDemandeDetails(!showDemandeDetails)}
                                 data={Object.keys(stats?.nbDemandesParEtat || [])
                                    .sort((e1, e2) => {
                                       const etat1 = getEtatDemandeInfo(e1);
                                       const etat2 = getEtatDemandeInfo(e2);
                                       return (etat1?.ordre || 0) - (etat2?.ordre || 0);
                                    })
                                    .map((key) => {
                                       const etat = etatsDemande?.items.find(
                                          (e) => e["@id"] === key,
                                       );
                                       const etatInfos = getEtatDemandeInfo(key);
                                       return {
                                          value: parseInt(
                                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                             stats?.nbDemandesParEtat?.[key as any] || "0",
                                          ),
                                          tooltip: etat?.libelle || "",
                                          color: etatInfos?.hexColor || etatInfos?.color || "grey",
                                       };
                                    })}
                              />
                           </div>
                           <Tooltip title="Détails des demandes">
                              <Button
                                 size="small"
                                 type="link"
                                 className="ml-1"
                                 icon={
                                    showDemandeDetails ? (
                                       <DownOutlined />
                                    ) : (
                                       <DownOutlined rotate={270} />
                                    )
                                 }
                                 onClick={() => setShowDemandeDetails(!showDemandeDetails)}
                              />
                           </Tooltip>
                        </Flex>
                        {showDemandeDetails && (
                           <Row gutter={[16, 16]} className="mt-2">
                              {Object.keys(stats?.nbDemandesParEtat || [])
                                 .sort((e1, e2) => {
                                    const etat1 = getEtatDemandeInfo(e1);
                                    const etat2 = getEtatDemandeInfo(e2);
                                    return (etat1?.ordre || 0) - (etat2?.ordre || 0);
                                 })
                                 .map((key) => {
                                    const etat = etatsDemande?.items.find((e) => e["@id"] === key);

                                    return (
                                       <Col key={key} xl={6} lg={12} xs={24} sm={12}>
                                          <Card
                                             className="pointer ant-card-stats-numeric ant-card-stats-hoverable"
                                             variant={"borderless"}
                                             onClick={() => {
                                                navigate(
                                                   `/demandeurs?filtreType=etat&filtreValeur=${key}`,
                                                );
                                             }}
                                          >
                                             <Statistic
                                                title={
                                                   <Flex align="center" gap={8}>
                                                      <Avatar
                                                         size={12}
                                                         style={{
                                                            backgroundColor:
                                                               getEtatDemandeInfo(key)?.hexColor,
                                                         }}
                                                      />
                                                      <span>{etat?.libelle}</span>
                                                   </Flex>
                                                }
                                                value={parseInt(
                                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                   stats?.nbDemandesParEtat?.[key as any] || "0",
                                                )}
                                                precision={0}
                                                isFetching={isFetching}
                                             />
                                          </Card>
                                       </Col>
                                    );
                                 })}
                           </Row>
                        )}
                     </div>
                  </div>
               )}
            </Col>

            <Col span={24} className="mt-2">
               <Typography.Title level={2}>Planification des évènements</Typography.Title>
               <Row gutter={[16, 16]}>
                  <Col xl={6} lg={12} xs={24} sm={12}>
                     <Card
                        className="pointer ant-card-stats-hoverable"
                        variant={"borderless"}
                        onClick={() => {
                           goToCalendar("day", AffectationFilterValues.Tous);
                        }}
                     >
                        <StatisticProgress
                           done={
                              (stats?.evenementsJour || 0) - (stats?.evenementsNonAffectesJour || 0)
                           }
                           title="Aujourd'hui"
                           total={stats?.evenementsJour || 0}
                           isFetching={isFetching}
                           evolution={stats?.evolutionJour || 0}
                        />
                     </Card>
                  </Col>
                  <Col xl={6} lg={12} xs={24} sm={12}>
                     <Card
                        className="pointer ant-card-stats-hoverable"
                        variant={"borderless"}
                        onClick={() => {
                           goToCalendar("work_week", AffectationFilterValues.Tous);
                        }}
                     >
                        <StatisticProgress
                           done={
                              (stats?.evenementsSemaine || 0) -
                              (stats?.evenementsNonAffectesSemaine || 0)
                           }
                           title="Cette semaine"
                           total={stats?.evenementsSemaine || 0}
                           isFetching={isFetching}
                           evolution={stats?.evolutionSemaine || 0}
                        />
                     </Card>
                  </Col>
                  <Col xl={6} lg={12} xs={24} sm={12}>
                     <Card
                        className="pointer ant-card-stats-hoverable"
                        variant={"borderless"}
                        onClick={() => {
                           goToCalendar("month", AffectationFilterValues.Tous);
                        }}
                     >
                        <StatisticProgress
                           done={
                              (stats?.evenementsMois || 0) - (stats?.evenementsNonAffectesMois || 0)
                           }
                           title="Ce mois-ci"
                           total={stats?.evenementsMois || 0}
                           isFetching={isFetching}
                           evolution={stats?.evolutionMois || 0}
                        />
                     </Card>
                  </Col>
                  {user?.isGestionnaire && (
                     <Col xl={6} lg={12} xs={24} sm={12}>
                        <Card
                           className="pointer ant-card-stats-numeric ant-card-stats-hoverable"
                           variant={"borderless"}
                           onClick={() => {
                              navigate(`/interventions/renforts`);
                           }}
                        >
                           <Statistic
                              title={pluriel(
                                 stats?.evenementsEnAttenteDeValidation || 0,
                                 "Intervention à valider",
                                 "Interventions à valider",
                              )}
                              value={stats?.evenementsEnAttenteDeValidation || 0}
                              precision={0}
                              isFetching={isFetching}
                              prefix={
                                 stats?.evenementsEnAttenteDeValidation &&
                                 stats?.evenementsEnAttenteDeValidation > 0 ? (
                                    <Tooltip
                                       title={`${stats?.evenementsEnAttenteDeValidation} ${`${pluriel(
                                          stats?.evenementsEnAttenteDeValidation,
                                          "intervention",
                                          "interventions",
                                       )} de renforts à valider`}`}
                                    >
                                       <WarningFilled className="text-warning mr-1" />
                                    </Tooltip>
                                 ) : undefined
                              }
                           />
                        </Card>
                     </Col>
                  )}
               </Row>
            </Col>
         </Row>
      </>
   );
}
