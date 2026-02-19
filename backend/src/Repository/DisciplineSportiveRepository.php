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

use App\Entity\DisciplineSportive;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DisciplineSportive>
 *
 * @method DisciplineSportive|null find($id, $lockMode = null, $lockVersion = null)
 * @method DisciplineSportive|null findOneBy(array $criteria, array $orderBy = null)
 * @method DisciplineSportive[]    findAll()
 * @method DisciplineSportive[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DisciplineSportiveRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DisciplineSportive::class);
    }

    public function save(DisciplineSportive $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
