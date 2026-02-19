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

use App\Repository\FormationRepository;
use App\State\EntityToResourceTransformer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: FormationRepository::class)]
#[Map(target: 'App\ApiResource\Formation', transform: [EntityToResourceTransformer::class, 'entityToResource'])]
class Formation
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $libelle = null;

    #[ORM\Column(length: 10)]
    #[Map(if: false)]
    private ?string $codeExterne = null;

    #[ORM\OneToMany(targetEntity: Inscription::class, mappedBy: 'formation', orphanRemoval: true)]
    #[Map(if: false)]
    private Collection $inscriptions;

    #[ORM\ManyToOne(inversedBy: 'formations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Map(if: false)]
    private ?Composante $composante = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $niveau = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $discipline = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $diplome = null;

    public function __construct()
    {
        $this->inscriptions = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    public function setLibelle(string $libelle): self
    {
        $this->libelle = $libelle;

        return $this;
    }

    public function getCodeExterne(): ?string
    {
        return $this->codeExterne;
    }

    public function setCodeExterne(string $codeExterne): self
    {
        $this->codeExterne = $codeExterne;

        return $this;
    }

    /**
     * @return Collection<int, Inscription>
     */
    public function getInscriptions(): Collection
    {
        return $this->inscriptions;
    }

    public function addInscription(Inscription $inscription): self
    {
        if (!$this->inscriptions->contains($inscription)) {
            $this->inscriptions->add($inscription);
            $inscription->setFormation($this);
        }

        return $this;
    }

    public function removeInscription(Inscription $inscription): self
    {
        if ($this->inscriptions->removeElement($inscription)) {
            // set the owning side to null (unless already changed)
            if ($inscription->getFormation() === $this) {
                $inscription->setFormation(null);
            }
        }

        return $this;
    }

    public function getComposante(): ?Composante
    {
        return $this->composante;
    }

    public function setComposante(?Composante $composante): self
    {
        $this->composante = $composante;

        return $this;
    }

    public function getNiveau(): ?string
    {
        return $this->niveau;
    }

    public function setNiveau(?string $niveau): static
    {
        $this->niveau = $niveau;

        return $this;
    }

    public function getDiscipline(): ?string
    {
        return $this->discipline;
    }

    public function setDiscipline(?string $discipline): static
    {
        $this->discipline = $discipline;

        return $this;
    }

    public function getDiplome(): ?string
    {
        return $this->diplome;
    }

    public function setDiplome(?string $diplome): static
    {
        $this->diplome = $diplome;

        return $this;
    }
}
