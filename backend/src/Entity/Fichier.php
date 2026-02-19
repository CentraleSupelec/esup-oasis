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

use App\ApiResource\Telechargement;
use App\Repository\FichierRepository;
use App\State\EntityToResourceTransformer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: FichierRepository::class)]
#[Map(target: Telechargement::class, transform: [EntityToResourceTransformer::class, 'entityToResource'])]
class Fichier
{
    public const string VOIR_FICHIER = 'VOIR_FICHIER';

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column]
    #[Map(if: false)]
    private array $metadata = [];

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $typeMime = null;

    #[ORM\ManyToOne(inversedBy: 'fichiers')]
    #[Map(if: false)]
    private ?Utilisateur $proprietaire = null;

    #[ORM\ManyToMany(targetEntity: Reponse::class, mappedBy: 'piecesJustificatives')]
    #[Map(if: false)]
    private Collection $reponses;

    #[ORM\OneToOne(mappedBy: 'fichier', cascade: ['persist', 'remove'])]
    #[Map(if: false)]
    private ?AvisEse $avisEse = null;
    #[ORM\OneToOne(mappedBy: 'fichier', cascade: ['persist', 'remove'])]
    #[Map(if: false)]
    private ?Entretien $entretien = null;

    #[ORM\OneToOne(mappedBy: 'fichier', cascade: ['persist', 'remove'])]
    #[Map(if: false)]
    private ?PieceJointeBeneficiaire $pieceJointeBeneficiaire = null;

    #[ORM\OneToOne(mappedBy: 'fichier', cascade: ['persist', 'remove'])]
    #[Map(if: false)]
    private ?DecisionAmenagementExamens $decisionAmenagementExamens = null;

    /**
     * @var Collection<int, ValeurParametre>
     */
    #[ORM\OneToMany(mappedBy: 'fichier', targetEntity: ValeurParametre::class)]
    #[Map(if: false)]
    private Collection $valeurParametres;

    #[ORM\OneToOne(mappedBy: 'fichier', cascade: ['persist', 'remove'])]
    #[Map(if: false)]
    private ?Bilan $bilan = null;

    public function __construct()
    {
        $this->reponses = new ArrayCollection();
        $this->valeurParametres = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function setMetadata(array $metadata): static
    {
        $this->metadata = $metadata;

        return $this;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getTypeMime(): ?string
    {
        return $this->typeMime;
    }

    public function setTypeMime(string $typeMime): static
    {
        $this->typeMime = $typeMime;

        return $this;
    }

    public function getProprietaire(): ?Utilisateur
    {
        return $this->proprietaire;
    }

    public function setProprietaire(?Utilisateur $proprietaire): static
    {
        $this->proprietaire = $proprietaire;

        return $this;
    }

    /**
     * @return Collection<int, Reponse>
     */
    public function getReponses(): Collection
    {
        return $this->reponses;
    }

    public function addReponse(Reponse $reponse): static
    {
        if (!$this->reponses->contains($reponse)) {
            $this->reponses->add($reponse);
            $reponse->addPieceJustificative($this);
        }

        return $this;
    }

    public function removeReponse(Reponse $reponse): static
    {
        if ($this->reponses->removeElement($reponse)) {
            $reponse->removePieceJustificative($this);
        }

        return $this;
    }

    public function getEntretien(): ?Entretien
    {
        return $this->entretien;
    }

    public function setEntretien(?Entretien $entretien): static
    {
        // unset the owning side of the relation if necessary
        if ($entretien === null && $this->entretien !== null) {
            $this->entretien->setFichier(null);
        }

        // set the owning side of the relation if necessary
        if ($entretien !== null && $entretien->getFichier() !== $this) {
            $entretien->setFichier($this);
        }

        $this->entretien = $entretien;

        return $this;
    }

    public function getAvisEse(): ?AvisEse
    {
        return $this->avisEse;
    }

    public function setAvisEse(?AvisEse $avisEse): static
    {
        // unset the owning side of the relation if necessary
        if ($avisEse === null && $this->avisEse !== null) {
            $this->avisEse->setFichier(null);
        }

        // set the owning side of the relation if necessary
        if ($avisEse !== null && $avisEse->getFichier() !== $this) {
            $avisEse->setFichier($this);
        }

        $this->avisEse = $avisEse;

        return $this;
    }

    public function getPieceJointeBeneficiaire(): ?PieceJointeBeneficiaire
    {
        return $this->pieceJointeBeneficiaire;
    }

    public function setPieceJointeBeneficiaire(PieceJointeBeneficiaire $pieceJointeBeneficiaire): static
    {
        // set the owning side of the relation if necessary
        if ($pieceJointeBeneficiaire->getFichier() !== $this) {
            $pieceJointeBeneficiaire->setFichier($this);
        }

        $this->pieceJointeBeneficiaire = $pieceJointeBeneficiaire;

        return $this;
    }

    public function getDecisionAmenagementExamens(): ?DecisionAmenagementExamens
    {
        return $this->decisionAmenagementExamens;
    }

    public function setDecisionAmenagementExamens(?DecisionAmenagementExamens $decisionAmenagementExamens): static
    {
        // unset the owning side of the relation if necessary
        if ($decisionAmenagementExamens === null && $this->decisionAmenagementExamens !== null) {
            $this->decisionAmenagementExamens->setFichier(null);
        }

        // set the owning side of the relation if necessary
        if ($decisionAmenagementExamens !== null && $decisionAmenagementExamens->getFichier() !== $this) {
            $decisionAmenagementExamens->setFichier($this);
        }

        $this->decisionAmenagementExamens = $decisionAmenagementExamens;

        return $this;
    }

    /**
     * @return Collection<int, ValeurParametre>
     */
    public function getValeurParametres(): Collection
    {
        return $this->valeurParametres;
    }

    public function addValeurParametre(ValeurParametre $valeurParametre): static
    {
        if (!$this->valeurParametres->contains($valeurParametre)) {
            $this->valeurParametres->add($valeurParametre);
            $valeurParametre->setFichier($this);
        }

        return $this;
    }

    public function removeValeurParametre(ValeurParametre $valeurParametre): static
    {
        if ($this->valeurParametres->removeElement($valeurParametre)) {
            // set the owning side to null (unless already changed)
            if ($valeurParametre->getFichier() === $this) {
                $valeurParametre->setFichier(null);
            }
        }

        return $this;
    }

    public function getBilan(): ?Bilan
    {
        return $this->bilan;
    }

    public function setBilan(?Bilan $bilan): static
    {
        // unset the owning side of the relation if necessary
        if ($bilan === null && $this->bilan !== null) {
            $this->bilan->setFichier(null);
        }

        // set the owning side of the relation if necessary
        if ($bilan !== null && $bilan->getFichier() !== $this) {
            $bilan->setFichier($this);
        }

        $this->bilan = $bilan;

        return $this;
    }
}
