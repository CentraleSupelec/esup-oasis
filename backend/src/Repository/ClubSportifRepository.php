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

use App\Entity\ClubSportif;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ClubSportif>
 *
 * @method ClubSportif|null find($id, $lockMode = null, $lockVersion = null)
 * @method ClubSportif|null findOneBy(array $criteria, array $orderBy = null)
 * @method ClubSportif[]    findAll()
 * @method ClubSportif[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ClubSportifRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ClubSportif::class);
    }

    public function save(ClubSportif $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
}
