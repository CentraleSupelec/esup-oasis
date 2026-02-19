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

namespace App\State\Evenement;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Evenement;
use App\ApiResource\Utilisateur;
use App\Entity\ApplicationCliente;
use App\Filter\PreloadAssociationsFilter;
use App\State\MappedCollectionPaginator;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class EvenementProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private ProviderInterface $collectionProvider,
        private Security $security,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $utilisateur = $this->security->getUser();

        if ($operation instanceof GetCollection) {
            //on ajoute "de force" un filtre sur l'utilisateur courant
            if (!$this->security->isGranted(ApplicationCliente::ROLE_APPLICATION_CLIENTE)) {
                $user = $utilisateur;
                $context['filters']['utilisateurConcerne'] =
                    Utilisateur::COLLECTION_URI . '/' . $user->getUserIdentifier();
            }

            /**
             * préchargements intervenant, bénéficiaires/profils, type équipement
             */
            $context['filters'][PreloadAssociationsFilter::PROPERTY] = [
                'beneficiaires' => [
                    'sourceEntity' => 'root',
                    'relationName' => 'beneficiaires',
                ],
                'beneficiaireUtilisateur' => [
                    'sourceEntity' => 'beneficiaires',
                    'relationName' => 'utilisateur',
                ],
                'beneficiaireIntervenant' => [
                    'sourceEntity' => 'beneficiaireUtilisateur',
                    'relationName' => 'intervenant',
                ],
                'profil' => [
                    'sourceEntity' => 'beneficiaires',
                    'relationName' => 'profil',
                ],
                'intervenant' => [
                    'sourceEntity' => 'root',
                    'relationName' => 'intervenant',
                ],
                'utilisateurIntervenant' => [
                    'sourceEntity' => 'intervenant',
                    'relationName' => 'utilisateur',
                ],
                'suppleants' => [
                    'sourceEntity' => 'root',
                    'relationName' => 'suppleants',
                ],
                'utilisateurSuppleant' => [
                    'sourceEntity' => 'suppleants',
                    'relationName' => 'utilisateur',
                ],
                'typeEquipement' => [
                    'sourceEntity' => 'root',
                    'relationName' => 'equipements',
                ],
                'enseignants' => [
                    'sourceEntity' => 'root',
                    'relationName' => 'enseignants',
                ],
                'intervenantEnseignant' => [
                    'sourceEntity' => 'enseignants',
                    'relationName' => 'intervenant',
                ],
                'utilisateurCreation' => [
                    'sourceEntity' => 'root',
                    'relationName' => 'utilisateurCreation',
                ],
                'utilisateurCreationIntervenant' => [
                    'sourceEntity' => 'utilisateurCreation',
                    'relationName' => 'intervenant',
                ],
            ];

            $result = $this->collectionProvider->provide($operation, $uriVariables, $context);
            assert($result instanceof PaginatorInterface);
            return new MappedCollectionPaginator($result, fn($utilisateur) => new Evenement($utilisateur));
        }

        $result = $this->itemProvider->provide($operation, $uriVariables, $context);

        return new Evenement($result);
    }
}
