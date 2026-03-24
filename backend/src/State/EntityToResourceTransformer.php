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

namespace App\State;

use ApiPlatform\Metadata\IriConverterInterface;

readonly class EntityToResourceTransformer
{
    public function __construct(
        private IriConverterInterface $iriConverter,
    ) {}

    public static function entityToResource($emptyResourceObject, $entity, $iriConverter = null)
    {
        $resourceClass = get_class($emptyResourceObject);
        return new $resourceClass($entity, $iriConverter);
    }

    //    function __invoke($emptyResourceObject, $entity)
    //    {
    //        dd('hello');
    //        return $this->entityToResource($emptyResourceObject, $entity, $this->iriConverter);
    //    }
    //    public function getIriConverter(): IriConverterInterface
    //    {
    //        return $this->iriConverter;
    //    }
}
