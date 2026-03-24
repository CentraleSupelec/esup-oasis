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

namespace App\State\Question;

use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\Pagination\PaginatorInterface;
use ApiPlatform\State\ProviderInterface;
use App\ApiResource\Charte;
use App\ApiResource\OptionReponse;
use App\ApiResource\Question;
use App\State\MappedCollectionPaginator;
use App\State\OptionReponse\OptionReponseProvider;
use Exception;
use Override;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

readonly class QuestionProvider implements ProviderInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.item_provider')]
        private ProviderInterface $itemProvider,
        #[Autowire(service: 'api_platform.doctrine.orm.state.collection_provider')]
        private ProviderInterface $collectionProvider,
        private OptionReponseProvider $optionReponseProvider,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        if ($operation instanceof GetCollection) {
            $results = $this->collectionProvider->provide($operation, $uriVariables, $context);
            assert($results instanceof PaginatorInterface);
            return new MappedCollectionPaginator($results, $this->handleReferenceTableOptions(...));
        }
        $entity = $this->itemProvider->provide($operation, $uriVariables, $context);
        return match ($entity) {
            null => null,
            default => $this->handleReferenceTableOptions($entity),
        };
    }

    public function handleReferenceTableOptions($entity): Question
    {
        $resource = new Question($entity);

        //gestion des tables de ref
        if ($entity->getTypeReponse() !== \App\Entity\Question::TYPE_TEXT) {
            $resource->optionsReponses = match ($table = $entity->getTableOptions()) {
                null => array_map(fn($option) => new OptionReponse($option), $entity->getOptionsReponse()->toArray()),
                default => $this->optionReponseProvider->getOptionsForTable($table, $resource->id),
            };
        }

        return $resource;
    }
}
