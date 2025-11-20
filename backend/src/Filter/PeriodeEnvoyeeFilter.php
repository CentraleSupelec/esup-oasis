<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

class PeriodeEnvoyeeFilter extends AbstractFilter
{

    public const string PROPERTY = 'periodeEnvoyeeFilter';

    protected function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        if ($property !== self::PROPERTY) {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];

        $queryBuilder
            ->andWhere($alias.'.dateEnvoi is not null');
    }

    /**
     * @inheritDoc
     */
    public function getDescription(string $resourceClass): array
    {
        return []; //filtre purement interne, non exposé
    }
}