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

namespace App\State\CampagneDemande;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\HttpOperation;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\AvisEse;
use App\ApiResource\CampagneDemande;
use App\State\MappedCollectionPaginator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class CampagneDemandeProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private ProviderInterface $collectionProvider,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        unset($uriVariables['typeId']);
        unset($context['uri_variables']['typeId']);

        assert($operation instanceof HttpOperation);
        $operationUriVariables = [$operation->getUriVariables()['id'] ?? null];

        if ($operation instanceof GetCollection) {
            //todo: filtrage sur type demande!!
            $results = $this->collectionProvider->provide(
                $operation->withUriVariables($operationUriVariables),
                $uriVariables,
                $context,
            );
            assert($results instanceof PaginatorInterface);
            return new MappedCollectionPaginator($results, fn($entity) => new CampagneDemande($entity));
        }
        $entity = $this->itemProvider->provide(
            $operation->withUriVariables($operationUriVariables),
            $uriVariables,
            $context,
        );
        return match ($entity) {
            null => null,
            default => new CampagneDemande($entity),
        };
    }
}
