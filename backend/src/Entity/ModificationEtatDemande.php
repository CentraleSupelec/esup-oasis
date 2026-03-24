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

namespace App\Entity;

use App\Repository\ModificationEtatDemandeRepository;
use App\State\EntityToResourceTransformer;
use DateTime;
use DateTimeInterface;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: ModificationEtatDemandeRepository::class)]
#[Map(target: \App\ApiResource\ModificationEtatDemande::class, transform: [
    EntityToResourceTransformer::class,
    'entityToResource',
])]
class ModificationEtatDemande
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'modifications')]
    #[ORM\JoinColumn(nullable: false)]
    #[Map(if: false)]
    private ?Demande $demande = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Map(if: false)]
    private ?EtatDemande $etat = null;

    #[ORM\ManyToOne]
    #[Map(if: false)]
    private ?EtatDemande $etatPrecedent = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Map(if: false)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Map(if: false)]
    private ?string $commentaire = null;

    #[ORM\ManyToOne]
    #[Map(if: false)]
    private ?ProfilBeneficiaire $profil = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Map(if: false)]
    private ?DateTimeInterface $dateModification = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDemande(): ?Demande
    {
        return $this->demande;
    }

    public function setDemande(?Demande $demande): static
    {
        $this->demande = $demande;

        return $this;
    }

    public function getEtat(): ?EtatDemande
    {
        return $this->etat;
    }

    public function setEtat(?EtatDemande $etat): static
    {
        $this->etat = $etat;

        return $this;
    }

    public function getEtatPrecedent(): ?EtatDemande
    {
        return $this->etatPrecedent;
    }

    public function setEtatPrecedent(?EtatDemande $etatPrecedent): static
    {
        $this->etatPrecedent = $etatPrecedent;

        return $this;
    }

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;

        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $commentaire): static
    {
        $this->commentaire = $commentaire;

        return $this;
    }

    public function getProfil(): ?ProfilBeneficiaire
    {
        return $this->profil;
    }

    public function setProfil(?ProfilBeneficiaire $profil): static
    {
        $this->profil = $profil;

        return $this;
    }

    public function getDateModification(): ?DateTimeInterface
    {
        return $this->dateModification;
    }

    public function setDateModification(DateTimeInterface $dateModification): static
    {
        $this->dateModification = DateTime::createFromInterface($dateModification);

        return $this;
    }
}
