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

use App\Entity\QuestionEtapeDemande;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<QuestionEtapeDemande>
 *
 * @method QuestionEtapeDemande|null find($id, $lockMode = null, $lockVersion = null)
 * @method QuestionEtapeDemande|null findOneBy(array $criteria, array $orderBy = null)
 * @method QuestionEtapeDemande[]    findAll()
 * @method QuestionEtapeDemande[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class QuestionEtapeDemandeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, QuestionEtapeDemande::class);
    }

    //    /**
    //     * @return QuestionEtapeDemande[] Returns an array of QuestionEtapeDemande objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('q')
    //            ->andWhere('q.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('q.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }
    //    public function findOneBySomeField($value): ?QuestionEtapeDemande
    //    {
    //        return $this->createQueryBuilder('q')
    //            ->andWhere('q.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
