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

use App\ApiResource\CharteUtilisateur;
use App\Repository\CharteDemandeurRepository;
use App\State\EntityToResourceTransformer;
use DateTime;
use DateTimeInterface;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: CharteDemandeurRepository::class)]
#[Map(target: CharteUtilisateur::class, transform: [EntityToResourceTransformer::class, 'entityToResource'])]
class CharteDemandeur
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'chartes')]
    #[ORM\JoinColumn(nullable: false)]
    #[Map(if: false)]
    private ?Demande $demande = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Map(if: false)]
    private ?Charte $charte = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Map(if: false)]
    private ?DateTimeInterface $dateValidation = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Map(if: false)]
    private ?string $contenu = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $libelle = null;

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

    public function getCharte(): ?Charte
    {
        return $this->charte;
    }

    public function setCharte(?Charte $charte): static
    {
        $this->charte = $charte;

        return $this;
    }

    public function getDateValidation(): ?DateTimeInterface
    {
        return $this->dateValidation;
    }

    public function setDateValidation(?DateTimeInterface $dateValidation): static
    {
        $this->dateValidation = match ($dateValidation) {
            null => null,
            default => DateTime::createFromInterface($dateValidation),
        };

        return $this;
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

    public function getLibelle(): ?string
    {
        return $this->libelle;
    }

    public function setLibelle(string $libelle): static
    {
        $this->libelle = $libelle;

        return $this;
    }

    public function estValidee(): bool
    {
        return null !== $this->getDateValidation();
    }
}
