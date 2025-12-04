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
        $qb = $this->createQueryBuilder('b')
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
        $qb = $this->createQueryBuilder('b')
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

}
