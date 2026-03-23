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

namespace App\State\TypeSuiviAmenagement;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\TypeSuiviAmenagement;
use App\Repository\TypeSuiviAmenagementRepository;
use Override;

readonly class TypeSuiviAmenagementProcessor implements ProcessorInterface
{
    public function __construct(
        private TypeSuiviAmenagementRepository $repository,
    ) {}

    #[Override]
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        /**
         * Uniquement POST et PATCH
         */

        $entity = match ($data->id) {
            null => new \App\Entity\TypeSuiviAmenagement(),
            default => $this->repository->find($data->id),
        };

        $entity->setLibelle($data->libelle);

        $entity->setActif($data->actif);

        $this->repository->save($entity, true);

        $resource = new TypeSuiviAmenagement($entity);

        return $resource;
    }
}
