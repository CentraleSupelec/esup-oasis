<?php

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use DateTime;
use Doctrine\ORM\QueryBuilder;
use Exception;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\PropertyInfo\Type;

class TauxHoraireDateFilter extends AbstractFilter
{

    protected function filterProperty(string $property, $value, QueryBuilder $queryBuilder, QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass, ?Operation $operation = null, array $context = []): void
    {
        if ($property !== 'date') {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];

        try {
            $date = new DateTime($value);
        } catch (Exception) {
            throw new HttpException(400, "date mal formée");
        }

        $queryBuilder
            ->andWhere(sprintf('%1$s.debut <= :date AND (%1$s.fin >= :date or %1$s.fin is null)', $rootAlias))
            ->setParameter('date', $date);

    }

    public function getDescription(string $resourceClass): array
    {
        return [
            'date' => [
                'property' => 'date',
                'type' => Type::BUILTIN_TYPE_STRING,
                'required' => false,
                'openapi' => [
                    'description' => 'Taux horaire valide pour la date passée',
                    'name' => 'profil',
                    'type' => 'string',
                    'format' => 'date'
                ],
            ],
        ];
    }
}