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

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

class PeriodeIntervenantFilter extends AbstractFilter
{

    public const string PROPERTY = 'periodeIntervenantFilter';

    /**
     * @inheritDoc
     */
    protected function filterProperty(
        string                      $property,
                                    $value,
        QueryBuilder                $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string                      $resourceClass,
        ?Operation                  $operation = null,
        array                       $context = [],
    ): void
    {
        if ($property !== self::PROPERTY) {
            return;
        }
        $alias = $queryBuilder->getRootAliases()[0];
        $evenementAlias = $queryNameGenerator->generateJoinAlias('evenements');
        $interventionAlias = $queryNameGenerator->generateJoinAlias('interventions');
        $intervenantAlias = $queryNameGenerator->generateJoinAlias('intervenant');
        $intervenantAlias2 = $queryNameGenerator->generateJoinAlias('intervenant');
        $utilisateurAlias = $queryNameGenerator->generateJoinAlias('utilisateur');
        $utilisateurAlias2 = $queryNameGenerator->generateJoinAlias('utilisateur');

        $queryBuilder
            ->join($alias . '.evenements', $evenementAlias)
            ->leftJoin($evenementAlias . '.intervenant', $intervenantAlias)
            ->leftJoin($intervenantAlias . '.utilisateur', $utilisateurAlias)
            ->leftJoin($alias . '.interventionsForfait', $interventionAlias)
            ->leftJoin($interventionAlias . '.intervenant', $intervenantAlias2)
            ->leftJoin($intervenantAlias2 . '.utilisateur', $utilisateurAlias2)
            ->andWhere($utilisateurAlias . '.uid = :uid or ' . $utilisateurAlias2 . '.uid = :uid')
            ->setParameter('uid', $value);
    }

    /**
     * @inheritDoc
     */
    public function getDescription(string $resourceClass): array
    {
        return []; //filtre purement interne, non exposé
    }
}