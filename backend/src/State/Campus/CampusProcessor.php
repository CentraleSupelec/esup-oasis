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

namespace App\State\Campus;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Campus;
use App\Repository\CampusRepository;
use Override;

readonly class CampusProcessor implements ProcessorInterface
{
    public function __construct(
        private CampusRepository $campusRepository,
    ) {}

    /**
     * @param \App\ApiResource\Campus $data
     */
    #[Override]
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if ($operation instanceof Patch) {
            $entity = $this->campusRepository->find($uriVariables['id']);
        } else {
            $entity = new Campus();
        }

        $entity->setActif($data->actif);
        $entity->setLibelle($data->libelle);

        $this->campusRepository->save($entity, true);

        return new \App\ApiResource\Campus($entity);
    }
}
