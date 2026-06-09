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
use ApiPlatform\Metadata\Exception\ItemNotFoundException;
use ApiPlatform\Metadata\IriConverterInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\OpenApi\Model\Parameter;
use App\Entity\Utilisateur;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\Serializer\NameConverter\NameConverterInterface;
use Symfony\Component\TypeInfo\TypeIdentifier;

class BeneficiaireFilter extends AbstractFilter
{
    use ClockAwareTrait;

    public const string PROPERTY = 'filtreBeneficiaire';

    public function __construct(
        private readonly IriConverterInterface $iriConverter,
        ManagerRegistry $managerRegistry,
        ?LoggerInterface $logger = null,
        ?array $properties = null,
        ?NameConverterInterface $nameConverter = null,
    ) {
        parent::__construct($managerRegistry, $logger, $properties, $nameConverter);
    }

    protected function filterProperty(
        string $property,
        $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        $entityClass = $operation->getStateOptions()?->getEntityClass() ?? $operation->getClass();
        if ($entityClass !== Utilisateur::class || $property !== self::PROPERTY) {
            return;
        }

        $alias = $queryBuilder->getRootAliases()[0];
        $beneficiaireAlias = $queryNameGenerator->generateJoinAlias('beneficiaire');

        $withCondition = '1 = 1';
        if ($value['date'] ?? false) {
            $nowParam = $queryNameGenerator->generateParameterName('now');
            $withCondition = sprintf(
                '%s.debut <= :%s and (%s.fin >= :%s or %s.fin is null)',
                $beneficiaireAlias,
                $nowParam,
                $beneficiaireAlias,
                $nowParam,
                $beneficiaireAlias,
            );
            $queryBuilder->setParameter($nowParam, $value['date']);
        } else {
            if ($value['avant'] ?? false) {
                $avantParam = $queryNameGenerator->generateParameterName('avant');
                $withCondition .= sprintf(' and %s.debut < :%s', $beneficiaireAlias, $avantParam);
                $queryBuilder->setParameter($avantParam, $value['avant']);
            }
            if ($value['apres'] ?? false) {
                $apresParam = $queryNameGenerator->generateParameterName('apres');
                $withCondition .= sprintf(
                    ' and (%s.fin > :%s or %s.fin is null)',
                    $beneficiaireAlias,
                    $apresParam,
                    $beneficiaireAlias,
                );
                $queryBuilder->setParameter($apresParam, $value['apres']);
            }
        }

        $queryBuilder->join($alias . '.beneficiaires', $beneficiaireAlias, Join::WITH, $withCondition);

        if ($value['profil'] ?? false) {
            try {
                $profil = $this->iriConverter->getResourceFromIri($value['profil']);
            } catch (ItemNotFoundException $e) {
                $this->logger->error($e->getMessage());
                throw $e;
            }
            $profilAlias = $queryNameGenerator->generateJoinAlias('profil');
            $profilIdParam = $queryNameGenerator->generateParameterName('profilId');
            $queryBuilder
                ->join($beneficiaireAlias . '.profil', $profilAlias)
                ->andWhere($profilAlias . '.id = :' . $profilIdParam)
                ->setParameter($profilIdParam, $profil->id);
        }
    }

    public function getDescription(string $resourceClass): array
    {
        return [
            self::PROPERTY . '[date]' => [
                'property' => self::PROPERTY . '[date]',
                'type' => TypeIdentifier::STRING->value,
                'required' => false,
                'openapi' => new Parameter(
                    name: self::PROPERTY . '[date]',
                    in: 'query',
                    description: 'date pour laquelle on veut les bénéficiaires valides',
                ),
            ],
            self::PROPERTY . '[avant]' => [
                'property' => self::PROPERTY . '[avant]',
                'type' => TypeIdentifier::STRING->value,
                'required' => false,
                'openapi' => new Parameter(
                    name: self::PROPERTY . '[avant]',
                    in: 'query',
                    description: 'date avant laquelle on veut les bénéficiaires valides',
                ),
            ],
            self::PROPERTY . '[apres]' => [
                'property' => self::PROPERTY . '[apres]',
                'type' => TypeIdentifier::STRING->value,
                'required' => false,
                'openapi' => new Parameter(
                    name: self::PROPERTY . '[apres]',
                    in: 'query',
                    description: 'date après laquelle on veut les bénéficiaires valides',
                ),
            ],
            self::PROPERTY . '[profil]' => [
                'property' => self::PROPERTY . '[profil]',
                'type' => TypeIdentifier::STRING->value,
                'required' => false,
                'openapi' => new Parameter(
                    name: self::PROPERTY . '[profil]',
                    in: 'query',
                    description: 'profil pour lequel on veut les bénéficiaires valides',
                ),
            ],
        ];
    }
}
