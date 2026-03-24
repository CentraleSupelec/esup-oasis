<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\State\TauxHoraire;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\TauxHoraire;
use App\State\MappedCollectionPaginator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class TauxHoraireCollectionProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private ProviderInterface $collectionProvider,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $results = $this->collectionProvider->provide($operation, $uriVariables, $context);
        assert($results instanceof PaginatorInterface);
        return new MappedCollectionPaginator($results, fn($entity) => new TauxHoraire($entity));
    }
}
