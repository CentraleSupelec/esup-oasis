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

use App\Entity\Beneficiaire;
use App\Entity\ProfilBeneficiaire;
use DateTimeInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Beneficiaire>
 *
 * @method Beneficiaire|null find($id, $lockMode = null, $lockVersion = null)
 * @method Beneficiaire|null findOneBy(array $criteria, array $orderBy = null)
 * @method Beneficiaire[]    findAll()
 * @method Beneficiaire[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class BeneficiaireRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Beneficiaire::class);
    }

    public function save(Beneficiaire $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Beneficiaire $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return Beneficiaire[]
     */
    public function profilsIncomplets(): array
    {
        $qb = $this
            ->createQueryBuilder('b')
            ->join('b.profil', 'p')
            ->andWhere('p.id = :id')
            ->setParameter('id', ProfilBeneficiaire::A_DETERMINER);

        return $qb->getQuery()->getResult();
    }

    /**
     * @return Beneficiaire[]
     */
    public function actifs(DateTimeInterface $now): array
    {
        $qb = $this
            ->createQueryBuilder('b')
            ->addSelect('u')
            ->addSelect('d')
            ->addSelect('i')
            ->join('b.utilisateur', 'u')
            ->leftJoin('u.intervenant', 'i')
            ->leftJoin('u.decisionsAmenagementExamens', 'd')
            ->andWhere(':now >= b.debut and (b.fin is null or :now < b.fin)')
            ->setParameter('now', $now);

        return $qb->getQuery()->getResult();
    }

    public function countActifs(DateTimeInterface $now): int
    {
        $qb = $this
            ->createQueryBuilder('b')
            ->select('count(distinct u.id) as nb')
            ->join('b.utilisateur', 'u')
            ->andWhere(':now >= b.debut and (b.fin is null or :now < b.fin)')
            ->setParameter('now', $now);

        return $qb->getQuery()->getOneOrNullResult()['nb'];
    }

    public function countActifsParProfil(DateTimeInterface $now, int $profilId): int
    {
        $qb = $this
            ->createQueryBuilder('b')
            ->select('count(distinct u.id) as nb')
            ->join('b.utilisateur', 'u')
            ->join('b.profil', 'p')
            ->andWhere(':now >= b.debut and (b.fin is null or :now < b.fin)')
            ->andWhere('p.id = :profilId')
            ->setParameter('now', $now)
            ->setParameter('profilId', $profilId);

        return $qb->getQuery()->getOneOrNullResult()['nb'];
    }

    public function countActifsParEtatDecisionAnneeU(DateTimeInterface $now, array $bornesAnnee, string $etatId): int
    {
        $qb = $this
            ->createQueryBuilder('b')
            ->select('count(distinct u.id) as nb')
            ->join('b.utilisateur', 'u')
            ->join('u.decisionsAmenagementExamens', 'd')
            ->andWhere(':now >= b.debut and (b.fin is null or :now < b.fin)')
            ->andWhere('d.etat = :etatId')
            ->andWhere('d.debut = :debut')
            ->andWhere('d.fin = :fin')
            ->setParameter('now', $now)
            ->setParameter('debut', $bornesAnnee['debut'])
            ->setParameter('fin', $bornesAnnee['fin'])
            ->setParameter('etatId', $etatId);

        return $qb->getQuery()->getOneOrNullResult()['nb'];
    }
}
