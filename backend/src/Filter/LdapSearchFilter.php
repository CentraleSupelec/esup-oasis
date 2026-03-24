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
use Symfony\Component\TypeInfo\TypeIdentifier;

class LdapSearchFilter implements FilterInterface
{
    /**
     * @inheritDoc
     */
    public function getDescription(string $resourceClass): array
    {
        return [
            'term' => [
                'property' => 'uid',
                'type' => TypeIdentifier::STRING,
                'required' => false,
                'strategy' => 'partial',
                'is_collection' => false,
            ],
        ];
    }
}
