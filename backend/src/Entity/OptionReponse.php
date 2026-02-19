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

use App\Repository\OptionReponseRepository;
use App\State\EntityToResourceTransformer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: OptionReponseRepository::class)]
#[Map(target: \App\ApiResource\OptionReponse::class, transform: [
    EntityToResourceTransformer::class,
    'entityToResource',
])]
class OptionReponse
{
    public const int OPTION_DEMANDE_ACCOMPAGNEMENT_OUI = -1;
    public const int OPTION_DEMANDE_ACCOMPAGNEMENT_NON = -2;

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $libelle = null;

    #[ORM\ManyToOne(inversedBy: 'optionsReponse')]
    #[ORM\JoinColumn(nullable: false)]
    #[Map(if: false)]
    private ?Question $question = null;

    #[ORM\ManyToMany(targetEntity: Question::class)]
    #[Map(if: false)]
    private Collection $questionsLiees;

    public function __construct()
    {
        $this->questionsLiees = new ArrayCollection();
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

    public function getQuestion(): ?Question
    {
        return $this->question;
    }

    public function setQuestion(?Question $question): static
    {
        $this->question = $question;

        return $this;
    }

    /**
     * @return Collection<int, Question>
     */
    public function getQuestionsLiees(): Collection
    {
        return $this->questionsLiees;
    }

    public function addQuestionsLiee(Question $questionsLiee): static
    {
        if (!$this->questionsLiees->contains($questionsLiee)) {
            $this->questionsLiees->add($questionsLiee);
        }

        return $this;
    }

    public function removeQuestionsLiee(Question $questionsLiee): static
    {
        $this->questionsLiees->removeElement($questionsLiee);

        return $this;
    }

    public function setId(?int $id): OptionReponse
    {
        $this->id = $id;
        return $this;
    }
}
