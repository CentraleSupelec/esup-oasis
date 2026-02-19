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

use App\Repository\TypeDemandeRepository;
use App\State\EntityToResourceTransformer;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: TypeDemandeRepository::class)]
#[Map(target: \App\ApiResource\TypeDemande::class, transform: [EntityToResourceTransformer::class, 'entityToResource'])]
class TypeDemande
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $libelle = null;

    #[ORM\ManyToMany(targetEntity: EtapeDemande::class, mappedBy: 'demande')]
    #[ORM\OrderBy(['ordre' => 'asc'])]
    #[Map(if: false)]
    private Collection $etapes;

    #[ORM\OneToMany(targetEntity: CampagneDemande::class, mappedBy: 'typeDemande', orphanRemoval: true)]
    #[Map(if: false)]
    private Collection $campagnes;

    #[ORM\ManyToMany(targetEntity: ProfilBeneficiaire::class, inversedBy: 'typesDemandes')]
    #[Map(if: false)]
    private Collection $profilsAssocies;

    #[ORM\Column(options: ['default' => true])]
    #[Map(if: false)]
    private ?bool $actif = true;

    #[ORM\Column(options: ['default' => false])]
    #[Map(if: false)]
    private ?bool $visibiliteLimitee = false;

    #[ORM\Column(options: ['default' => false])]
    #[Map(if: false)]
    private ?bool $accompagnementOptionnel = false;

    public function __construct()
    {
        $this->etapes = new ArrayCollection();
        $this->campagnes = new ArrayCollection();
        $this->profilsAssocies = new ArrayCollection();
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

    /**
     * @return Collection<int, EtapeDemande>
     */
    public function getEtapes(): Collection
    {
        return $this->etapes;
    }

    public function addEtape(EtapeDemande $etape): static
    {
        if (!$this->etapes->contains($etape)) {
            $this->etapes->add($etape);
            $etape->addDemande($this);
        }

        return $this;
    }

    public function removeEtape(EtapeDemande $etape): static
    {
        if ($this->etapes->removeElement($etape)) {
            $etape->removeDemande($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, CampagneDemande>
     */
    public function getCampagnes(): Collection
    {
        return $this->campagnes;
    }

    public function addCampagne(CampagneDemande $campagne): static
    {
        if (!$this->campagnes->contains($campagne)) {
            $this->campagnes->add($campagne);
            $campagne->setTypeDemande($this);
        }

        return $this;
    }

    public function removeCampagne(CampagneDemande $campagne): static
    {
        if ($this->campagnes->removeElement($campagne)) {
            // set the owning side to null (unless already changed)
            if ($campagne->getTypeDemande() === $this) {
                $campagne->setTypeDemande(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ProfilBeneficiaire>
     */
    public function getProfilsAssocies(): Collection
    {
        return $this->profilsAssocies;
    }

    public function addProfilAssocie(ProfilBeneficiaire $profilsAssocy): static
    {
        if (!$this->profilsAssocies->contains($profilsAssocy)) {
            $this->profilsAssocies->add($profilsAssocy);
        }

        return $this;
    }

    //nécessaire pour le bon fonctionnement du merdier automatique
    public function addProfilsAssocy(ProfilBeneficiaire $profilsAssocy): static
    {
        return $this->addProfilAssocie($profilsAssocy);
    }

    public function removeProfilAssocie(ProfilBeneficiaire $profilsAssocy): static
    {
        $this->profilsAssocies->removeElement($profilsAssocy);

        return $this;
    }

    //nécessaire pour le bon fonctionnement du merdier automatique
    public function removeProfilsAssocy(ProfilBeneficiaire $profilsAssocy): static
    {
        return $this->removeProfilAssocie($profilsAssocy);
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
     * @param DateTimeInterface $point
     * @return CampagneDemande|null
     */
    public function getCampagneEnCoursPourDate(DateTimeInterface $point): ?CampagneDemande
    {
        foreach ($this->getCampagnes() as $campagne) {
            if ($campagne->getDebut() <= $point && $campagne->getFin() >= $point) {
                return $campagne;
            }
        }
        return null;
    }

    public function isVisibiliteLimitee(): ?bool
    {
        return $this->visibiliteLimitee;
    }

    public function setVisibiliteLimitee(bool $visibiliteLimitee): static
    {
        $this->visibiliteLimitee = $visibiliteLimitee;

        return $this;
    }

    public function isAccompagnementOptionnel(): ?bool
    {
        return $this->accompagnementOptionnel;
    }

    public function setAccompagnementOptionnel(bool $accompagnementOptionnel): static
    {
        $this->accompagnementOptionnel = $accompagnementOptionnel;

        return $this;
    }

    public function estPourSportifs(): bool
    {
        $idProfilsAssocies = array_map(fn($profil) => $profil->getId(), $this->getProfilsAssocies()->toArray());
        return !empty(array_intersect($idProfilsAssocies, [
            ProfilBeneficiaire::SPORTIF_HAUT_NIVEAU,
            ProfilBeneficiaire::SPORTIF_TRES_BON_NIVEAU,
            ProfilBeneficiaire::SPORTIF_BON_NIVEAU,
        ]));
    }
}
