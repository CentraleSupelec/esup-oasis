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

use App\Entity\InterventionForfait;
use App\Entity\PeriodeRH;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<InterventionForfait>
 *
 * @method InterventionForfait|null find($id, $lockMode = null, $lockVersion = null)
 * @method InterventionForfait|null findOneBy(array $criteria, array $orderBy = null)
 * @method InterventionForfait[]    findAll()
 * @method InterventionForfait[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class InterventionForfaitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, InterventionForfait::class);
    }

    public function save(InterventionForfait $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(InterventionForfait $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function parPeriodeEtIntervenant(PeriodeRH $periode, ?string $uid = null)
    {
        if ($uid) {
            $qb = $this
                ->createQueryBuilder('e')
                ->join('e.intervenant', 'i')
                ->join('i.utilisateur', 'u', JOIN::WITH, 'u.uid = :uid')
                ->andWhere('e.periode = :periode')
                ->setParameter('periode', $periode)
                ->setParameter('uid', $uid);
        } else {
            $qb = $this
                ->createQueryBuilder('e')
                ->andWhere('e.periode = :periode')
                ->join('e.intervenant', 'i')
                ->join('i.utilisateur', 'u', JOIN::WITH, 'u.gestionnaire = false')
                ->setParameter('periode', $periode);
        }

        return $qb->getQuery()->getResult();
    }
}
