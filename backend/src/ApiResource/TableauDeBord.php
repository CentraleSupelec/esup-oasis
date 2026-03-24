<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\ApiResource;

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\OpenApi\Model\Operation;
use ApiPlatform\OpenApi\Model\Parameter;
use App\State\Stats\TableauDeBordProvider;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: self::ITEM_URI,
            openapi: new Operation(parameters: [
                new Parameter(
                    name: 'utilisateur',
                    in: 'query',
                    description: 'utilisateur concerné',
                    required: false,
                    allowEmptyValue: false,
                    schema: ['type' => 'string'],
                ),
            ]),
            security: 'is_granted("'
            . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR
            . '") or is_granted("'
            . \App\Entity\Utilisateur::ROLE_INTERVENANT
            . '")',
        ),
    ],
    cacheHeaders: [
        'public' => false,
    ],
    provider: TableauDeBordProvider::class,
)]
class TableauDeBord
{
    public const string ITEM_URI = '/statistiques';

    /**
     * @var int nb total d'événements pour le jour courant
     */
    public int $evenementsJour;
    /**
     * @var int différence par rapport à la veille
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $evolutionJour;
    /**
     * @var int nb total d'événements sur la semaine en cours (lundi=>dimanche)
     */
    public int $evenementsSemaine;

    /**
     * @var int différence par rapport à la semaine précédente
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $evolutionSemaine;
    /**
     * @var int nb total d'événements sur le mois
     */
    //    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $evenementsMois;
    /**
     * @var int différence par rapport au mois précédent
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $evolutionMois;
    /**
     * @var int nb d'évenements non affectés pour le jour courant
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $evenementsNonAffectesJour;
    /**
     * @var int nb d'événements non affectés dans les 7 jours qui viennent
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $evenementsNonAffectesSemaine;
    /**
     * @var int nb d'événements non affectés dans les 30 jours qui viennent
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $evenementsNonAffectesMois;

    /**
     * @var int total nb d'événements non affectés
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $totalEvenementsNonAffectes;

    /**
     * @var int nb d'événements sans bénéficiaires alors qu'ils devraient en avoir un
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $evenementsSansBeneficiaire;

    /**
     * @var int nb d'événements en attente de validation
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $evenementsEnAttenteDeValidation;

    /**
     * @var int nb de bénéficiaires avec un profil "à déterminer"
     */
    #[ApiProperty(security: "is_granted('" . BeneficiaireProfil::VOIR_PROFILS . "')")]
    public int $nbBeneficiairesIncomplets;

    /**
     * @var int nb de demandes sur les campagnes ouvertes
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $nbDemandesEnCours;

    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public array $nbDemandesParEtat;

    /**
     * @var int nb de bénéficiaires en cours
     */
    #[ApiProperty(security: "is_granted('" . BeneficiaireProfil::VOIR_PROFILS . "')")]
    public int $nbBeneficiaires;

    /**
     * @var int nb d'intervenants actifs
     */
    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_PLANIFICATEUR . "')")]
    public int $nbIntervenants;

    #[ApiProperty(security: "is_granted('" . BeneficiaireProfil::VOIR_PROFILS . "')")]
    public int $nbAvisEseEnAttente;

    #[ApiProperty(security: "is_granted('" . BeneficiaireProfil::VOIR_PROFILS . "')")]
    public int $nbDecisionsAttenteValidation;

    #[ApiProperty(security: "is_granted('" . \App\Entity\Utilisateur::ROLE_ADMIN . "')")]
    public int $nbDecisionsAEditer;

    #[ApiProperty(security: "is_granted('" . BeneficiaireProfil::VOIR_PROFILS . "')")]
    public int $nbAmenagementsEnCours;
}
