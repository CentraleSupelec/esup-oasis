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

use App\Repository\TypeSuiviAmenagementRepository;
use App\State\EntityToResourceTransformer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: TypeSuiviAmenagementRepository::class)]
#[Map(target: \App\ApiResource\TypeSuiviAmenagement::class, transform: [
    EntityToResourceTransformer::class,
    'entityToResource',
])]
class TypeSuiviAmenagement
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $libelle = null;

    #[ORM\Column(options: ['default' => true])]
    #[Map(if: false)]
    private ?bool $actif = true;

    #[ORM\OneToMany(targetEntity: Amenagement::class, mappedBy: 'suivi')]
    #[Map(if: false)]
    private Collection $amenagements;

    public function __construct()
    {
        $this->amenagements = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    public function setLibelle(string $libelle): static
    {
        $this->libelle = $libelle;

        return $this;
    }

    public function isActif(): ?bool
    {
        return $this->actif;
    }

    public function setActif(bool $actif): static
    {
        $this->actif = $actif;

        return $this;
    }

    /**
     * @return Collection<int, Amenagement>
     */
    public function getAmenagements(): Collection
    {
        return $this->amenagements;
    }

    public function addAmenagement(Amenagement $amenagement): static
    {
        if (!$this->amenagements->contains($amenagement)) {
            $this->amenagements->add($amenagement);
            $amenagement->setSuivi($this);
        }

        return $this;
    }

    public function removeAmenagement(Amenagement $amenagement): static
    {
        if ($this->amenagements->removeElement($amenagement)) {
            // set the owning side to null (unless already changed)
            if ($amenagement->getSuivi() === $this) {
                $amenagement->setSuivi(null);
            }
        }

        return $this;
    }
}
