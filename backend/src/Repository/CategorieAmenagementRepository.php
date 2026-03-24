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

namespace App\Repository;

use App\Entity\CategorieAmenagement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CategorieAmenagement>
 *
 * @method CategorieAmenagement|null find($id, $lockMode = null, $lockVersion = null)
 * @method CategorieAmenagement|null findOneBy(array $criteria, array $orderBy = null)
 * @method CategorieAmenagement[]    findAll()
 * @method CategorieAmenagement[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CategorieAmenagementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CategorieAmenagement::class);
    }

    public function save(CategorieAmenagement $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return CategorieAmenagement[]
     */
    public function getByType(?bool $examens = null, ?bool $aideHumaine = null, ?bool $pedagogique = null): array
    {
        $qb = $this->createQueryBuilder('c');
        $qb->join('c.typesAmenagement', 'types');

        if (null !== $examens) {
            $qb->andWhere('types.examens = :examens')->setParameter('examens', $examens);
        }
        if (null !== $aideHumaine) {
            $qb->andWhere('types.aideHumaine = :aidehumaine')->setParameter('aidehumaine', $aideHumaine);
        }
        if (null !== $pedagogique) {
            $qb->andWhere('types.pedagogique = :pedagogique')->setParameter('pedagogique', $pedagogique);
        }

        return $qb->getQuery()->getResult();
    }
}
