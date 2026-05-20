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

namespace App\Filter;

use ApiPlatform\Metadata\FilterInterface;
use ApiPlatform\OpenApi\Model\Parameter;
use Symfony\Component\TypeInfo\TypeIdentifier;

class DemandeFormatFilter implements FilterInterface
{
    public function getDescription(string $resourceClass): array
    {
        return [
            'format_simple' => [
                'property' => 'format simplifié',
                'type' => TypeIdentifier::BOOL->value,
                'required' => false,
                'is_collection' => false,
                'openapi' => new Parameter(
                    name: 'format_simple',
                    in: 'query',
                    description: 'format simplifié',
                    schema: ['type' => 'boolean'],
                ),
            ],
        ];
    }
}
