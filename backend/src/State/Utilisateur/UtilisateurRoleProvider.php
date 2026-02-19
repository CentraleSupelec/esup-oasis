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
use App\Service\ErreurLdapException;

readonly class UtilisateurRoleProvider implements ProviderInterface
{
    public function __construct(
        private UtilisateurProvider $utilisateurProvider,
    ) {}

    /**
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return object|array|null
     * @throws ErreurLdapException
     */
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $context['filters']['role'] = $uriVariables['roleId'];

        /**
         * On veut toujours les inscriptions, les tags, les profils...on les charge dès la première requête
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
            'campus' => [
                'sourceEntity' => 'intervenant',
                'relationName' => 'campuses',
            ],
            'competences' => [
                'sourceEntity' => 'intervenant',
                'relationName' => 'competences',
            ],
            'types_evenements' => [
                'sourceEntity' => 'intervenant',
                'relationName' => 'typesEvenements',
            ],
        ];

        return $this->utilisateurProvider->provide($operation, [], $context);
    }
}
