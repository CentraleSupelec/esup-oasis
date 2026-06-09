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

namespace App\State\PieceJustificative;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Charte;
use App\ApiResource\Telechargement;
use App\Entity\Fichier;
use App\State\MappedCollectionPaginator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

readonly class TelechargementProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private ProviderInterface $collectionProvider,
        private UrlGeneratorInterface $urlGenerator,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation instanceof GetCollection) {
            $results = $this->collectionProvider->provide($operation, $uriVariables, $context);
            assert($results instanceof PaginatorInterface);
            return new MappedCollectionPaginator($results, $this->transform(...));
        }
        $entity = $this->itemProvider->provide($operation, $uriVariables, $context);

        return match ($entity) {
            null => null,
            default => $this->transform($entity),
        };
    }

    private function transform(Fichier $entity): Telechargement
    {
        $resource = new Telechargement($entity);

        $resource->urlContenu = $this->urlGenerator->generate(
            'fichiers_download',
            ['fileId' => $entity->getId()],
            UrlGeneratorInterface::ABSOLUTE_PATH,
        );

        return $resource;
    }
}
