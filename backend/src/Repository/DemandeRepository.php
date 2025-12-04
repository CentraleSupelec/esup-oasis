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

use App\Entity\Demande;
use App\Entity\EtatDemande;
use App\Entity\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Query\Expr\Join;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Clock\ClockAwareTrait;

/**
 * @extends ServiceEntityRepository<Demande>
 *
 * @method Demande|null find($id, $lockMode = null, $lockVersion = null)
 * @method Demande|null findOneBy(array $criteria, array $orderBy = null)
 * @method Demande[]    findAll()
 * @method Demande[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class DemandeRepository extends ServiceEntityRepository
{
    use ClockAwareTrait;

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Demande::class);
    }

    public function save(Demande $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }

    }

    public function findDemandeEnCoursPourUtilisateurEtCampagne(string $uid, int $campagneId)
    {
        return $this->createQueryBuilder('d')
            ->join('d.demandeur', 'demandeur')
            ->join('d.campagne', 'campagne')
            ->where('demandeur.uid = :uid')
            ->andWhere('campagne.id = :campagneId')
            ->setParameter('uid', $uid)
            ->setParameter('campagneId', $campagneId)
            ->getQuery()
            ->getOneOrNullResult();

    }

    public function demandesObsoletes()
    {
        $now = $this->now();
        return $this->createQueryBuilder('d')
            ->join('d.campagne', 'c', Join::WITH,
                condition: 'c.dateArchivage is not null and c.dateArchivage < :now')
            ->join('d.etat', 'e')
            ->andWhere('e.id = ' . EtatDemande::EN_COURS . ' or e.id = ' . EtatDemande::NON_CONFORME)
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();
    }

    /**
     * @return Demande[]
     */
    public function findDemandesEnCours(?Utilisateur $utilisateur): array
    {

        $qb = $this->createQueryBuilder('d')
            ->join('d.campagne', 'campagne')
            ->andWhere('campagne.debut <= :now and (campagne.fin is null or campagne.fin > :now)')
            ->setParameter('now', $this->now());

        //si non gestionnaire, il faut filtrer!
        if (in_array(Utilisateur::ROLE_RENFORT, $utilisateur->getRoles())) {
            $qb->join('campagne.typeDemande', 'type')
                ->andWhere('type.visibiliteLimitee = false');
        }

        return $qb->getQuery()
            ->getResult();
    }

    public function countDemandesEnCoursParEtat(?Utilisateur $utilisateur): array
    {
        $qb = $this->createQueryBuilder('d')
            ->select('e.id, count(d) as nb')
            ->join('d.campagne', 'campagne')
            ->join('d.etat', 'e')
            ->andWhere('campagne.debut <= :now and (campagne.fin is null or campagne.fin > :now)')
            ->groupBy('e.id')
            ->setParameter('now', $this->now());

        //si non gestionnaire, il faut filtrer!
        if (in_array(Utilisateur::ROLE_RENFORT, $utilisateur->getRoles())) {
            $qb->join('campagne.typeDemande', 'type')
                ->andWhere('type.visibiliteLimitee = false');
        }

        return $qb->getQuery()
            ->getResult();
    }

}
