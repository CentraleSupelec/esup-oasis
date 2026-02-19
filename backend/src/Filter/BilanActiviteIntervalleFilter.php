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

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

class BilanActiviteIntervalleFilter extends AbstractFilter
{
    public const string PROPERTY = 'intervalle';

    protected function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        if ($property !== self::PROPERTY || !is_array($value)) {
            return;
        }

        [$debut, $fin] = $value;

        //on ajoute le filtre sur les utilisateurs ayant au moins un bénéficiaire valide entre debut et fin
        $rootAlias = $queryBuilder->getRootAliases()[0];
        $benefAlias = $queryNameGenerator->generateJoinAlias('beneficiaires');
        $debutParam = $queryNameGenerator->generateParameterName('debut');
        $finParam = $queryNameGenerator->generateParameterName('fin');

        $queryBuilder
            ->join(sprintf('%s.beneficiaires', $rootAlias), $benefAlias)
            ->andWhere(sprintf(
                '(%1$s.debut >= :%2$s and %1$s.debut < :%3$s) or (:%2$s >= %1$s.debut and (%1$s.fin is null or :%2$s <= %1$s.fin))',
                $benefAlias,
                $debutParam,
                $finParam,
            ))
            ->andWhere(sprintf('%s.avecAccompagnement = true', $benefAlias))
            ->setParameter($debutParam, $debut)
            ->setParameter($finParam, $fin);
    }

    public function getDescription(string $resourceClass): array
    {
        return [];
    }
}
