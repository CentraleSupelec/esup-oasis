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

namespace App\State\InterventionForfait;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Charte;
use App\ApiResource\InterventionForfait;
use App\ApiResource\Utilisateur;
use App\State\MappedCollectionPaginator;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class InterventionForfaitProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private ProviderInterface $collectionProvider,
        private Security $security,
    ) {}

    function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        /**
         * Si non planificateur, on limite la liste aux interventions de la personne en tant qu'intervenant
         */
        if ($operation instanceof GetCollection) {
            //on ajoute "de force" un filtre sur l'utilisateur courant
            if (!$this->security->isGranted(\App\Entity\Utilisateur::ROLE_PLANIFICATEUR)) {
                $user = $this->security->getUser();
                $context['filters']['intervenant'] = Utilisateur::COLLECTION_URI . '/' . $user->getUserIdentifier();
            }
            $results = $this->collectionProvider->provide($operation, $uriVariables, $context);
            assert($results instanceof PaginatorInterface);
            return new MappedCollectionPaginator($results, fn($entity) => new InterventionForfait($entity));
        }

        $entity = $this->itemProvider->provide($operation, $uriVariables, $context);
        return match ($entity) {
            null => null,
            default => new InterventionForfait($entity),
        };
    }
}
