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

use App\Repository\CharteRepository;
use App\State\EntityToResourceTransformer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;
use Symfony\Component\ObjectMapper\Transform\MapCollection;

#[ORM\Entity(repositoryClass: CharteRepository::class)]
#[Map(target: \App\ApiResource\Charte::class, transform: [EntityToResourceTransformer::class, 'entityToResource'])]
class Charte
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Map(if: false)]
    private ?string $contenu = null;

    #[ORM\ManyToMany(targetEntity: ProfilBeneficiaire::class, inversedBy: 'chartes')]
    #[Map(if: false)]
    private Collection $profilsAssocies;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $libelle = null;

    public function __construct()
    {
        $this->profilsAssocies = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContenu(): ?string
    {
        return $this->contenu;
    }

    public function setContenu(string $contenu): static
    {
        $this->contenu = $contenu;

        return $this;
    }

    /**
     * @return Collection<int, ProfilBeneficiaire>
     */
    public function getProfilsAssocies(): Collection
    {
        return $this->profilsAssocies;
    }

    public function addProfilsAssocy(ProfilBeneficiaire $profilsAssocy): static
    {
        if (!$this->profilsAssocies->contains($profilsAssocy)) {
            $this->profilsAssocies->add($profilsAssocy);
        }

        return $this;
    }

    public function removeProfilsAssocy(ProfilBeneficiaire $profilsAssocy): static
    {
        $this->profilsAssocies->removeElement($profilsAssocy);

        return $this;
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
}
