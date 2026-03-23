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

namespace App\State\CategorieAmenagement;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\CategorieAmenagement;
use App\Repository\CategorieAmenagementRepository;

readonly class CategorieAmenagementProcessor implements ProcessorInterface
{
    function __construct(
        private CategorieAmenagementRepository $repository,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if ($operation instanceof Patch) {
            $entity = $this->repository->find($uriVariables['id']);
        } else {
            $entity = new CategorieAmenagement();
        }

        $entity->setActif($data->actif);
        $entity->setLibelle($data->libelle);

        $this->repository->save($entity, true);

        return new \App\ApiResource\CategorieAmenagement($entity);
    }
}
