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
use ApiPlatform\State\ProviderInterface;
use App\Filter\PreloadAssociationsFilter;

readonly class BeneficiaireProvider implements ProviderInterface
{
    public function __construct(
        private UtilisateurProvider $utilisateurProvider,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $context['filters']['exists']['beneficiaire'] = $context['filters']['exists']['beneficiaire'] ?? true;

        /**
         * On veut toujours les inscriptions, les tags, les profils...on les charge dès la première requête
         */
        $context['filters'][PreloadAssociationsFilter::PROPERTY] = [
            'beneficiaires' => [
                'sourceEntity' => 'root',
                'relationName' => 'beneficiaires',
            ],
            'tags_beneficiaires' => [
                'sourceEntity' => 'beneficiaires',
                'relationName' => 'tags',
            ],
            'categorie_tag' => [
                'sourceEntity' => 'tags_beneficiaires',
                'relationName' => 'categorie',
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
        ];

        return $this->utilisateurProvider->provide($operation, $uriVariables, $context);
    }
}
