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

use App\Repository\QuestionRepository;
use App\State\EntityToResourceTransformer;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\ObjectMapper\Attribute\Map;

#[ORM\Entity(repositoryClass: QuestionRepository::class)]
#[Map(target: \App\ApiResource\Question::class, transform: [EntityToResourceTransformer::class, 'entityToResource'])]
class Question
{
    public const string TYPE_SUBMIT = 'submit';
    public const string TYPE_TEXT = 'text';
    public const string TYPE_TEXTAREA = 'textarea';
    public const string TYPE_SELECT = 'select';
    public const string TYPE_CHECKBOX = 'checkbox';
    public const string TYPE_INFO = 'info';
    public const string TYPE_FILE = 'file';

    public const string CHAMP_CIBLE_TEL_PERSO = 'tel_perso';
    public const string CHAMP_CIBLE_EMAIL_PERSO = 'email_perso';
    public const string CHAMP_CONTACT_URGENCE = 'contact_urgence';

    public const int QUESTION_DEMANDE_ACCOMPAGNEMENT = -1;

    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'SEQUENCE')]
    #[ORM\Column]
    #[Map(if: false)]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $libelle = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Map(if: false)]
    private ?string $aide = null;

    #[ORM\Column(length: 255)]
    #[Map(if: false)]
    private ?string $typeReponse = null;

    #[ORM\OneToMany(mappedBy: 'question', targetEntity: OptionReponse::class, cascade: ['persist'])]
    #[Map(if: false)]
    private Collection $optionsReponse;

    #[ORM\OneToMany(mappedBy: 'question', targetEntity: Reponse::class, indexBy: 'repondant_id')]
    #[Map(if: false)]
    private Collection $reponses;

    #[ORM\Column(options: ['default' => false])]
    #[Map(if: false)]
    private ?bool $obligatoire = false;

    #[ORM\Column(options: ['default' => false])]
    #[Map(if: false)]
    private ?bool $reponseConservable = false;

    #[ORM\Column(options: ['default' => false])]
    #[Map(if: false)]
    private ?bool $choixMultiple = false;

    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $tableOptions = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Map(if: false)]
    private ?string $champCible = null;

    public function __construct()
    {
        $this->optionsReponse = new ArrayCollection();
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

    public function getAide(): ?string
    {
        return $this->aide;
    }

    public function setAide(?string $aide): static
    {
        $this->aide = $aide;

        return $this;
    }

    public function getTypeReponse(): ?string
    {
        return $this->typeReponse;
    }

    public function setTypeReponse(string $typeReponse): static
    {
        $this->typeReponse = $typeReponse;

        return $this;
    }

    /**
     * @return Collection<int, OptionReponse>
     */
    public function getOptionsReponse(): Collection
    {
        return $this->optionsReponse;
    }

    public function addOptionsReponse(OptionReponse $optionsReponse): static
    {
        if (!$this->optionsReponse->contains($optionsReponse)) {
            $this->optionsReponse->add($optionsReponse);
            $optionsReponse->setQuestion($this);
        }

        return $this;
    }

    public function removeOptionsReponse(OptionReponse $optionsReponse): static
    {
        if ($this->optionsReponse->removeElement($optionsReponse)) {
            // set the owning side to null (unless already changed)
            if ($optionsReponse->getQuestion() === $this) {
                $optionsReponse->setQuestion(null);
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
            $reponse->setQuestion($this);
        }

        return $this;
    }

    public function removeReponse(Reponse $reponse): static
    {
        if ($this->reponses->removeElement($reponse)) {
            // set the owning side to null (unless already changed)
            if ($reponse->getQuestion() === $this) {
                $reponse->setQuestion(null);
            }
        }

        return $this;
    }

    public function isObligatoire(): ?bool
    {
        return $this->obligatoire;
    }

    public function setObligatoire(bool $obligatoire): static
    {
        $this->obligatoire = $obligatoire;

        return $this;
    }

    public function isReponseConservable(): ?bool
    {
        return $this->reponseConservable;
    }

    public function setReponseConservable(bool $reponseConservable): static
    {
        $this->reponseConservable = $reponseConservable;

        return $this;
    }

    /**
     * @param Reponse[] $reponses
     */
    public function getQuestionsLiees(array $reponses): iterable
    {
        $reponseCourante = array_filter($reponses, fn(Reponse $reponse) => $reponse->getQuestion() === $this);
        if (empty($reponseCourante)) {
            return [];
        }
        $reponseCourante = current($reponseCourante);

        foreach ($reponseCourante->getOptionsChoisies() as $option) {
            foreach ($option->getQuestionsLiees() as $liee) {
                yield $liee;
                foreach ($liee->getQuestionsLiees($reponses) as $questionsLiee) {
                    yield $questionsLiee;
                }
            }
        }
    }

    public function isChoixMultiple(): ?bool
    {
        return $this->choixMultiple;
    }

    public function setChoixMultiple(bool $choixMultiple): static
    {
        $this->choixMultiple = $choixMultiple;

        return $this;
    }

    public function getTableOptions(): ?string
    {
        return $this->tableOptions;
    }

    public function setTableOptions(?string $tableOptions): static
    {
        $this->tableOptions = $tableOptions;

        return $this;
    }

    public function setId(?int $id): Question
    {
        $this->id = $id;
        return $this;
    }

    public function getChampCible(): ?string
    {
        return $this->champCible;
    }

    public function setChampCible(?string $champCible): static
    {
        $this->champCible = $champCible;

        return $this;
    }
}
