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

namespace App\State\TypeDemande;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\CampagneDemande;
use App\ApiResource\Charte;
use App\ApiResource\TypeDemande;
use App\Filter\PreloadAssociationsFilter;
use App\State\MappedCollectionPaginator;
use Exception;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class TypeDemandeProvider implements ProviderInterface
{
    use ClockAwareTrait;

    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private readonly ProviderInterface $itemProvider,
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private readonly ProviderInterface $collectionProvider,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation instanceof GetCollection) {
            /**
             * préchargement des profils liés, des campagnes et des étapes/questions
             */

            $context['filters'][PreloadAssociationsFilter::PROPERTY] = [
                'campagnes' => [
                    'sourceEntity' => 'root',
                    'relationName' => 'campagnes',
                ],
                'etapes' => [
                    'sourceEntity' => 'root',
                    'relationName' => 'etapes',
                ],
                'questions' => [
                    'sourceEntity' => 'etapes',
                    'relationName' => 'questionsEtape',
                ],
                'profils' => [
                    'sourceEntity' => 'root',
                    'relationName' => 'profilsAssocies',
                ],
            ];

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

    /**
     * @param \App\Entity\TypeDemande $entity
     * @return TypeDemande
     * @throws Exception
     */
    public function transform(\App\Entity\TypeDemande $entity): TypeDemande
    {
        $resource = new TypeDemande($entity);

        $now = $this->now();
        $precedente = null;
        $prochaine = null;
        foreach ($entity->getCampagnes() as $campagne) {
            //campagne en cours
            if ($campagne->getDebut() <= $now && $now <= $campagne->getFin()) {
                $resource->campagneEnCours = new CampagneDemande($campagne);
                continue;
            }
            //campagne terminée
            if ($campagne->getFin() < $now) {
                if ($precedente == null || $precedente->getFin() < $campagne->getFin()) {
                    $precedente = $campagne;
                }
                continue;
            }
            //campagne dans le futur...c'est la prochaine ?
            if ($prochaine === null || $prochaine->getDebut() > $campagne->getDebut()) {
                $prochaine = $campagne;
            }
        }
        $resource->campagnePrecedente = match (true) {
            null !== $precedente => new CampagneDemande($precedente),
            default => null,
        };
        $resource->campagneSuivante = match (true) {
            null !== $prochaine => new CampagneDemande($prochaine),
            default => null,
        };

        return $resource;
    }
}
