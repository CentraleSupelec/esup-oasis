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

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\OpenApi\Model\Parameter;
use DateTime;
use Doctrine\ORM\QueryBuilder;
use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\TypeInfo\TypeIdentifier;

class TauxHoraireDateFilter extends AbstractFilter
{
    protected function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        if ($property !== 'date') {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];

        try {
            $date = new DateTime($value);
        } catch (Exception) {
            throw new HttpException(400, 'date mal formée');
        }

        $queryBuilder->andWhere(sprintf(
            '%1$s.debut <= :date AND (%1$s.fin >= :date or %1$s.fin is null)',
            $rootAlias,
        ))->setParameter('date', $date);
    }

    public function getDescription(string $resourceClass): array
    {
        return [
            'date' => [
                'property' => 'date',
                'type' => TypeIdentifier::STRING,
                'required' => false,
                'openapi' => new Parameter(
                    name: 'taux',
                    in: 'query',
                    description: 'Taux horaire valide pour la date passée',
                ),
            ],
        ];
    }
}
