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

use App\Entity\CategorieTag;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CategorieTag>
 *
 * @method CategorieTag|null find($id, $lockMode = null, $lockVersion = null)
 * @method CategorieTag|null findOneBy(array $criteria, array $orderBy = null)
 * @method CategorieTag[]    findAll()
 * @method CategorieTag[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CategorieTagRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CategorieTag::class);
    }

    public function save(CategorieTag $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
