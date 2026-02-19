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

use App\Repository\TauxHoraireRepository;
use App\State\EntityToResourceTransformer;
use DateTime;
use DateTimeInterface;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: TauxHoraireRepository::class)]
#[Map(target: \App\ApiResource\TauxHoraire::class, transform: [EntityToResourceTransformer::class, 'entityToResource'])]
class TauxHoraire
{
    use ClockAwareTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 5, scale: 2)]
    #[Map(if: false)]
    private ?string $montant = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Map(if: false)]
    private ?DateTimeInterface $debut = null;

    #[ORM\Column(type: Types::DATE_MUTABLE, nullable: true)]
    #[Map(if: false)]
    private ?DateTimeInterface $fin = null;

    #[ORM\ManyToOne(inversedBy: 'tauxHoraires')]
    #[ORM\JoinColumn(nullable: false)]
    #[Map(if: false)]
    private ?TypeEvenement $typeEvenement = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMontant(): ?string
    {
        return $this->montant;
    }

    public function setMontant(string $montant): self
    {
        $this->montant = $montant;

        return $this;
    }

    public function getDebut(): ?DateTimeInterface
    {
        return $this->debut;
    }

    public function setDebut(DateTimeInterface $debut): self
    {
        $this->debut = DateTime::createFromInterface($debut);

        return $this;
    }

    public function getFin(): ?DateTimeInterface
    {
        return $this->fin;
    }

    public function setFin(?DateTimeInterface $fin): self
    {
        $this->fin = match ($fin) {
            null => null,
            default => DateTime::createFromInterface($fin),
        };

        return $this;
    }

    public function getTypeEvenement(): ?TypeEvenement
    {
        return $this->typeEvenement;
    }

    public function setTypeEvenement(?TypeEvenement $typeEvenement): self
    {
        $this->typeEvenement = $typeEvenement;

        return $this;
    }

    public function estActif(): bool
    {
        $now = $this->now();
        if ($this->getDebut() <= $now && (null === $this->getFin() || $now < $this->getFin())) {
            return true;
        }
        return false;
    }
}
