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

namespace App\State\TypeEvenement;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Charte;
use App\ApiResource\TauxHoraire;
use App\ApiResource\TypeEvenement;
use App\State\MappedCollectionPaginator;
use Exception;
use Override;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class TypeEvenementProvider implements ProviderInterface
{
    use ClockAwareTrait;

    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private readonly ProviderInterface $itemProvider,
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private readonly ProviderInterface $collectionProvider,
    ) {}

    #[Override]
    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        //on ajoute un tri par défaut sur les libellés
        if (null == ($context['filters']['order'] ?? null)) {
            $context['filters']['order']['libelle'] = 'asc';
        }
        if ($operation instanceof GetCollection) {
            $results = $this->collectionProvider->provide($operation, $uriVariables, $context);
            assert($results instanceof PaginatorInterface);
            return new MappedCollectionPaginator($results, $this->transform(...));
        }

        $typeEvenement = $this->itemProvider->provide($operation, $uriVariables, $context);

        return match ($typeEvenement) {
            null => null,
            default => $this->transform($typeEvenement),
        };
    }

    /**
     * @param \App\Entity\TypeEvenement $entity
     * @return TypeEvenement
     * @throws Exception
     */
    public function transform($entity): TypeEvenement
    {
        $resource = new TypeEvenement($entity);

        $resource->tauxHoraires = array_map(fn($taux) => new TauxHoraire($taux), $entity->getTauxHoraires()->toArray());

        $resource->tauxActif = array_reduce($entity->getTauxHoraires()->toArray(), fn(
            $carry,
            \App\Entity\TauxHoraire $taux,
        ) => match (true) {
            $taux->getDebut() <= $this->now() && (null == $taux->getFin() || $taux->getFin() > $this->now())
                => new TauxHoraire($taux),
            default => null,
        });
        return $resource;
    }
}
