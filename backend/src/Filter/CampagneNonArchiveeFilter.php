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
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\TypeInfo\TypeIdentifier;

class CampagneNonArchiveeFilter extends AbstractFilter
{
    use ClockAwareTrait;

    public const string PROPERTY = 'archivees';

    protected function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        if ($property !== self::PROPERTY || !is_string($value) || $value != 'false') {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $campagneAlias = $queryNameGenerator->generateJoinAlias('campagne');

        $queryBuilder
            ->join(sprintf('%s.campagne', $rootAlias), $campagneAlias)
            ->andWhere(sprintf('%1$s.dateArchivage IS NULL or %1$s.dateArchivage >= :now', $campagneAlias))
            ->setParameter('now', $this->now());
    }

    public function getDescription(string $resourceClass): array
    {
        return [
            'archivees' => [
                'property' => 'archivees',
                'type' => TypeIdentifier::BOOL,
                'required' => false,
                'is_collection' => false,
                'openapi' => new Parameter(
                    name: 'archivees',
                    in: 'query',
                    description: 'inclure les demandes des campagnes archivées ?',
                    schema: ['type' => 'bool'],
                ),
            ],
        ];
    }
}
