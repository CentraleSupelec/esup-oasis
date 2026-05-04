<?php

/*
 * Copyright (c) 2024. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\State\Tag;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Tag;
use App\State\MappedCollectionPaginator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class TagProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private ProviderInterface $collectionProvider,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        //on ajoute un tri par défaut sur les libellés
        if (null == ($context['filters']['order'] ?? null)) {
            $context['filters']['order']['libelle'] = 'asc';
        }

        if ($operation instanceof GetCollection) {
            //on ajoute un tri par défaut sur les libellés
            if (null == ($context['filters']['order'] ?? null)) {
                $context['filters']['order']['libelle'] = 'asc';
            }

            $results = $this->collectionProvider->provide($operation, $uriVariables, $context);
            assert($results instanceof PaginatorInterface);
            return new MappedCollectionPaginator($results, fn($entity) => new Tag($entity));
        }

        $result = $this->itemProvider->provide($operation, $uriVariables, $context);

        assert($result instanceof \App\Entity\Tag || $result === null);

        return match ($result) {
            null => null,
            default => new Tag($result),
        };
    }
}
