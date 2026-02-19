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

use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\Clock\ClockAwareTrait;

trait BeneficiaireActifAwareFilterTrait
{
    use ClockAwareTrait;

    protected function filterBeneficiairesActifs(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $utilisateurAlias,
    ): string {
        $bAlias = $queryNameGenerator->generateJoinAlias('beneficiaires');
        $nowParam = $queryNameGenerator->generateParameterName('now');
        $withCondition =
            ':'
            . $nowParam
            . ' >= '
            . $bAlias
            . '.debut and (:'
            . $nowParam
            . ' < '
            . $bAlias
            . '.fin or '
            . $bAlias
            . '.fin is null)';

        $queryBuilder
            ->join($utilisateurAlias . '.beneficiaires', $bAlias)
            ->andWhere($withCondition)
            ->setParameter($nowParam, $this->now());

        return $bAlias;
    }
}
