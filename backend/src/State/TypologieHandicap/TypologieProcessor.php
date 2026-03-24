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

namespace App\State\TypologieHandicap;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;

readonly class TypologieProcessor implements ProcessorInterface
{
    function __construct() {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        assert('This should not be called  : ' . __CLASS__ . '::' . __METHOD__);
    }
}
