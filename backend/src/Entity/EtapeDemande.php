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

use App\Repository\EtapeDemandeRepository;
use App\State\EntityToResourceTransformer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: EtapeDemandeRepository::class)]
#[Map(target: \App\ApiResource\EtapeDemande::class, transform: [
    EntityToResourceTransformer::class,
    'entityToResource',
])]
class EtapeDemande
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
    private ?int $ordre = null;

    #[ORM\ManyToMany(targetEntity: TypeDemande::class, inversedBy: 'etapes')]
    #[Map(if: false)]
    private Collection $demande;

    #[ORM\OneToMany(mappedBy: 'etape', targetEntity: QuestionEtapeDemande::class)]
    #[ORM\OrderBy(['ordre' => 'asc'])]
    #[Map(if: false)]
    private Collection $questionsEtape;

    #[ORM\Column(options: ['default' => false])]
    #[Map(if: false)]
    private ?bool $siDemandeAccompagnement = false;

    public function __construct()
    {
        $this->demande = new ArrayCollection();
        $this->questionsEtape = new ArrayCollection();
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

    public function getOrdre(): ?int
    {
        return $this->ordre;
    }

    public function setOrdre(int $ordre): static
    {
        $this->ordre = $ordre;

        return $this;
    }

    /**
     * @return Collection<int, TypeDemande>
     */
    public function getDemande(): Collection
    {
        return $this->demande;
    }

    public function addDemande(TypeDemande $demande): static
    {
        if (!$this->demande->contains($demande)) {
            $this->demande->add($demande);
        }

        return $this;
    }

    public function removeDemande(TypeDemande $demande): static
    {
        $this->demande->removeElement($demande);

        return $this;
    }

    /**
     * @return Collection<int, QuestionEtapeDemande>
     */
    public function getQuestionsEtape(): Collection
    {
        return $this->questionsEtape;
    }

    public function addQuestionsEtape(QuestionEtapeDemande $questionsEtape): static
    {
        if (!$this->questionsEtape->contains($questionsEtape)) {
            $this->questionsEtape->add($questionsEtape);
            $questionsEtape->setEtape($this);
        }

        return $this;
    }

    public function removeQuestionsEtape(QuestionEtapeDemande $questionsEtape): static
    {
        if ($this->questionsEtape->removeElement($questionsEtape)) {
            // set the owning side to null (unless already changed)
            if ($questionsEtape->getEtape() === $this) {
                $questionsEtape->setEtape(null);
            }
        }

        return $this;
    }

    /**
     * @param Reponse[] $reponses
     * @return iterable
     */
    public function getQuestionsAvecReponsesExistantes(array $reponses): iterable
    {
        /**
         * @var Question[] $questions
         */
        $questions = array_map(
            fn(QuestionEtapeDemande $qe) => $qe->getQuestion(),
            $this->getQuestionsEtape()->toArray(),
        );
        foreach ($questions as $question) {
            yield $question;
            foreach ($question->getQuestionsLiees($reponses) as $liee) {
                yield $liee;
            }
        }
    }

    public function isSiDemandeAccompagnement(): ?bool
    {
        return $this->siDemandeAccompagnement;
    }

    public function setSiDemandeAccompagnement(bool $siDemandeAccompagnement): static
    {
        $this->siDemandeAccompagnement = $siDemandeAccompagnement;

        return $this;
    }
}
