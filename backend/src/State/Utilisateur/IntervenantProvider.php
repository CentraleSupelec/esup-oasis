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

namespace App\State\Utilisateur;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Utilisateur;
use App\Filter\IntervenantFilter;
use App\Filter\PreloadAssociationsFilter;

readonly class IntervenantProvider implements ProviderInterface
{
    public function __construct(
        private UtilisateurProvider $utilisateurProvider,
    ) {}

    public function provide(
        Operation $operation,
        array $uriVariables = [],
        array $context = [],
    ): Utilisateur|array|PaginatorInterface {
        $context['filters'][IntervenantFilter::PROPERTY] = true;

        /**
         * Préchargement campus, service, competences, inscriptions, types événements, decisions
         */
        $context['filters'][PreloadAssociationsFilter::PROPERTY] = [
            'beneficiaires' => [
                'sourceEntity' => 'root',
                'relationName' => 'beneficiaires',
            ],
            'profilBeneficiaire' => [
                'sourceEntity' => 'beneficiaires',
                'relationName' => 'profil',
            ],
            'decisionsAmenagementExamens' => [
                'sourceEntity' => 'root',
                'relationName' => 'decisionsAmenagementExamens',
            ],
            'inscriptions' => [
                'sourceEntity' => 'root',
                'relationName' => 'inscriptions',
            ],
            'formation' => [
                'sourceEntity' => 'inscriptions',
                'relationName' => 'formation',
            ],
            'composante' => [
                'sourceEntity' => 'formation',
                'relationName' => 'composante',
            ],
            'services' => [
                'sourceEntity' => 'root',
                'relationName' => 'services',
            ],
            'intervenant' => [
                'sourceEntity' => 'root',
                'relationName' => 'intervenant',
            ],
            'campuses' => [
                'sourceEntity' => 'intervenant',
                'relationName' => 'campuses',
            ],
            'competences' => [
                'sourceEntity' => 'intervenant',
                'relationName' => 'competences',
            ],
            'typesEvenements' => [
                'sourceEntity' => 'intervenant',
                'relationName' => 'typesEvenements',
            ],
        ];

        return $this->utilisateurProvider->provide($operation, $uriVariables, $context);
    }
}
