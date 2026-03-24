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
use App\Filter\EtatDecisionAmenagementFilter;
use App\Repository\UtilisateurRepository;

readonly class BeneficiaireProvider implements ProviderInterface
{
    public function __construct(
        private UtilisateurProvider $utilisateurProvider,
        private UtilisateurRepository $utilisateurRepository,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $context['filters']['beneficiairefilter'] = true;
        //        /**
        //         * On veut toujours les inscriptions, les tags, les profils...on les charge dès la première requête
        //         */
        //                $context['filters'][PreloadAssociationsFilter::PROPERTY] = [
        $associations = [
            'beneficiaires' => [
                'sourceEntity' => 'root',
                'relationName' => 'beneficiaires',
                'joinType' => 'INNER',
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
                'joinType' => 'INNER',
            ],
            'decisionsAmenagementExamens' => [
                'sourceEntity' => 'root',
                'relationName' => 'decisionsAmenagementExamens',
                'joinType' => $context['filters'][EtatDecisionAmenagementFilter::PROPERTY] ?? false ? 'INNER' : 'LEFT',
            ],
            'inscriptions' => [
                'sourceEntity' => 'root',
                'relationName' => 'inscriptions',
                'joinType' => 'INNER',
            ],
            'formation' => [
                'sourceEntity' => 'inscriptions',
                'relationName' => 'formation',
                'joinType' => 'INNER',
            ],
            'composante' => [
                'sourceEntity' => 'formation',
                'relationName' => 'composante',
                'joinType' => 'INNER',
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

        $paginator = $this->utilisateurProvider->provide($operation, $uriVariables, $context);

        $userIds = [];
        foreach ($paginator as $resource) {
            $userIds[] = $resource->uid;
        }

        $this->utilisateurRepository->preload($userIds, $associations);

        return $paginator;
    }
}
