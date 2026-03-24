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

use App\Repository\CategorieAmenagementRepository;
use App\State\EntityToResourceTransformer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: CategorieAmenagementRepository::class)]
#[Map(target: \App\ApiResource\CategorieAmenagement::class, transform: [
    EntityToResourceTransformer::class,
    'entityToResource',
])]
class CategorieAmenagement
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $libelle = null;

    #[ORM\Column]
    #[Map(if: false)]
    private ?bool $actif = null;

    #[ORM\OneToMany(targetEntity: TypeAmenagement::class, mappedBy: 'categorie')]
    #[Map(if: false)]
    private Collection $typesAmenagement;

    /**
     * @var Collection<int, Reponse>
     */
    #[ORM\ManyToMany(targetEntity: Reponse::class, mappedBy: 'categoriesAmenagement')]
    #[Map(if: false)]
    private Collection $reponses;

    public function __construct()
    {
        $this->typesAmenagement = new ArrayCollection();
        $this->reponses = new ArrayCollection();
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
     * @return Collection<int, TypeAmenagement>
     */
    public function getTypesAmenagement(): Collection
    {
        return $this->typesAmenagement;
    }

    public function addTypesAmenagement(TypeAmenagement $typesAmenagement): static
    {
        if (!$this->typesAmenagement->contains($typesAmenagement)) {
            $this->typesAmenagement->add($typesAmenagement);
            $typesAmenagement->setCategorie($this);
        }

        return $this;
    }

    public function removeTypesAmenagement(TypeAmenagement $typesAmenagement): static
    {
        if ($this->typesAmenagement->removeElement($typesAmenagement)) {
            // set the owning side to null (unless already changed)
            if ($typesAmenagement->getCategorie() === $this) {
                $typesAmenagement->setCategorie(null);
            }
        }

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
            $reponse->addCategoriesAmenagement($this);
        }

        return $this;
    }

    public function removeReponse(Reponse $reponse): static
    {
        if ($this->reponses->removeElement($reponse)) {
            $reponse->removeCategoriesAmenagement($this);
        }

        return $this;
    }
}
