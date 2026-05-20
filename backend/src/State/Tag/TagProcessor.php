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

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Tag;
use App\Repository\CategorieTagRepository;
use App\Repository\TagRepository;
use Override;

readonly class TagProcessor implements ProcessorInterface
{
    public function __construct(
        private TagRepository $tagRepository,
        private CategorieTagRepository $categorieTagRepository,
    ) {}

    /**
     * @param \App\ApiResource\Tag $data
     */
    #[Override]
    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = [],
    ): \App\ApiResource\Tag {
        $entity = match ($data->id) {
            null => new Tag(),
            default => $this->tagRepository->find($data->id),
        };

        $entity->setLibelle($data->libelle);
        $entity->setActif($data->actif);
        $entity->setCategorie($this->categorieTagRepository->find($data->categorie->id));

        $this->tagRepository->save($entity, true);

        return new \App\ApiResource\Tag($entity);
    }
}
