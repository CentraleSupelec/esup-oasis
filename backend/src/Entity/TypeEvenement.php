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

use App\Repository\TypeEvenementRepository;
use App\State\EntityToResourceTransformer;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: TypeEvenementRepository::class)]
#[Map(target: \App\ApiResource\TypeEvenement::class, transform: [
    EntityToResourceTransformer::class,
    'entityToResource',
])]
class TypeEvenement
{
    public const int TYPE_RENFORT = -1;

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

    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $couleur = null;

    #[ORM\Column(options: ['default' => true])]
    #[Map(if: false)]
    private ?bool $visibleParDefaut = true;

    #[ORM\OneToMany(mappedBy: 'type', targetEntity: Evenement::class, orphanRemoval: true)]
    #[Map(if: false)]
    private Collection $evenements;

    #[ORM\ManyToMany(targetEntity: Intervenant::class, mappedBy: 'typesEvenements')]
    #[Map(if: false)]
    private Collection $intervenants;

    #[ORM\Column]
    #[Map(if: false)]
    private ?bool $avecValidation = null;

    #[ORM\OneToMany(mappedBy: 'typeEvenement', targetEntity: TauxHoraire::class)]
    #[Map(if: false)]
    private Collection $tauxHoraires;

    #[ORM\Column(options: ['default' => false])]
    #[Map(if: false)]
    private bool $forfait = false;

    public function __construct()
    {
        $this->evenements = new ArrayCollection();
        $this->intervenants = new ArrayCollection();
        $this->tauxHoraires = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): self
    {
        $this->id = $id;
        return $this;
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

    public function isActif(): ?bool
    {
        return $this->actif;
    }

    public function setActif(bool $actif): self
    {
        $this->actif = $actif;

        return $this;
    }

    public function getCouleur(): ?string
    {
        return $this->couleur;
    }

    public function setCouleur(?string $couleur): self
    {
        $this->couleur = $couleur;

        return $this;
    }

    public function isVisibleParDefaut(): ?bool
    {
        return $this->visibleParDefaut;
    }

    public function setVisibleParDefaut(bool $visibleParDefaut): self
    {
        $this->visibleParDefaut = $visibleParDefaut;

        return $this;
    }

    /**
     * @return Collection<int, Evenement>
     */
    public function getEvenements(): Collection
    {
        return $this->evenements;
    }

    public function addEvenement(Evenement $evenement): self
    {
        if (!$this->evenements->contains($evenement)) {
            $this->evenements->add($evenement);
            $evenement->setType($this);
        }

        return $this;
    }

    public function removeEvenement(Evenement $evenement): self
    {
        if ($this->evenements->removeElement($evenement)) {
            // set the owning side to null (unless already changed)
            if ($evenement->getType() === $this) {
                $evenement->setType(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Intervenant>
     */
    public function getIntervenants(): Collection
    {
        return $this->intervenants;
    }

    public function addIntervenant(Intervenant $intervenant): self
    {
        if (!$this->intervenants->contains($intervenant)) {
            $this->intervenants->add($intervenant);
            $intervenant->addTypesEvenement($this);
        }

        return $this;
    }

    public function removeIntervenant(Intervenant $intervenant): self
    {
        if ($this->intervenants->removeElement($intervenant)) {
            $intervenant->removeTypesEvenement($this);
        }

        return $this;
    }

    public function isAvecValidation(): ?bool
    {
        return $this->avecValidation;
    }

    public function setAvecValidation(bool $avecValidation): self
    {
        $this->avecValidation = $avecValidation;

        return $this;
    }

    /**
     * @return Collection<int, TauxHoraire>
     */
    public function getTauxHoraires(): Collection
    {
        return $this->tauxHoraires;
    }

    public function addTauxHoraire(TauxHoraire $tauxHoraire): self
    {
        if (!$this->tauxHoraires->contains($tauxHoraire)) {
            $this->tauxHoraires->add($tauxHoraire);
            $tauxHoraire->setTypeEvenement($this);
        }

        return $this;
    }

    public function removeTauxHoraire(TauxHoraire $tauxHoraire): self
    {
        if ($this->tauxHoraires->removeElement($tauxHoraire)) {
            // set the owning side to null (unless already changed)
            if ($tauxHoraire->getTypeEvenement() === $this) {
                $tauxHoraire->setTypeEvenement(null);
            }
        }

        return $this;
    }

    public function isForfait(): bool
    {
        return $this->forfait;
    }

    public function setForfait(bool $forfait): static
    {
        $this->forfait = $forfait;

        return $this;
    }

    /**
     * @return null|TauxHoraire
     */
    public function getTauxHoraireActif(): ?TauxHoraire
    {
        foreach ($this->getTauxHoraires() as $tauxHoraire) {
            if ($tauxHoraire->estActif()) {
                return $tauxHoraire;
            }
        }
        return null;
    }

    /**
     * @param DateTimeInterface|null $date
     * @return null
     */
    public function getTauxHoraireActifPourDate(?DateTimeInterface $date): ?TauxHoraire
    {
        foreach ($this->getTauxHoraires() as $tauxHoraire) {
            if (
                $tauxHoraire->getDebut() <= $date
                && (null === $tauxHoraire->getFin() || $date <= $tauxHoraire->getFin())
            ) {
                return $tauxHoraire;
            }
        }
        return null;
    }
}
