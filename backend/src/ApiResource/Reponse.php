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

namespace App\ApiResource;

use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Put;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Reponse\ReponseProcessor;
use App\State\Reponse\ReponseProvider;
use App\Validator\IdentifiantSportifHautNiveauValideConstraint;
use App\Validator\ValidationDemandePossibleConstraint;
use DateTimeInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: self::ITEM_URI,
            uriVariables: ['demandeId', 'questionId'],
            provider: ReponseProvider::class,
        ),
        new Put(uriTemplate: self::ITEM_URI, uriVariables: ['demandeId', 'questionId'], read: false, allowCreate: true),
    ],
    normalizationContext: ['groups' => [self::GROUP_OUT]],
    denormalizationContext: ['groups' => [self::GROUP_IN]],
    openapi: new Operation(tags: ['Demandes']),
    processor: ReponseProcessor::class,
    stateOptions: new Options(entityClass: \App\Entity\Reponse::class),
)]
#[Assert\Expression(
    expression: 'this.countOptionsChoisies() == 0 or this.questionId in this.getQuestionsIdOptions() ',
    message: 'Option invalide pour cette question',
)]
#[Assert\Expression(
    expression: 'this.countOptionsChoisies() != 0 or (this.question.typeReponse != "select"
                        and this.question.typeReponse != "checkbox")',
    message: 'Cette question attend une option de la liste prédéfinie',
)]
//#[QuestionAttenduePourDemandeConstraint]//todo
#[ValidationDemandePossibleConstraint]
#[IdentifiantSportifHautNiveauValideConstraint]
class Reponse
{
    public const string ITEM_URI = '/demandes/{demandeId}/questions/{questionId}/reponse';
    public const string GROUP_IN = 'reponse:in';
    public const string GROUP_OUT = 'reponse:out';

    //copies pour simplifier la gestion des variables d'url
    #[Ignore]
    public ?int $demandeId = null {
        get {
            if ($this->demandeId === null && $this->entity !== null) {
                $this->demandeId = $this->entity->getDemande()->getId();
            }
            return $this->demandeId ?? null;
        }
    }

    #[Ignore]
    public ?int $questionId = null {
        get {
            if ($this->questionId === null && $this->entity !== null) {
                $this->questionId = $this->entity->getQuestion()->getId();
            }
            return $this->questionId ?? null;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?Utilisateur $repondant = null {
        get {
            if ($this->repondant === null && $this->entity !== null) {
                $this->repondant = new Utilisateur($this->entity->getRepondant());
            }
            return $this->repondant ?? null;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?Demande $demande = null {
        get {
            if ($this->demande === null && $this->entity !== null) {
                $this->demande = new Demande($this->entity->getDemande());
            }
            return $this->demande ?? null;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?Question $question = null {
        get {
            if ($this->question === null && $this->entity !== null) {
                $this->question = new Question($this->entity->getQuestion());
            }
            return $this->question ?? null;
        }
    }

    /**
     * @var OptionReponse[]
     */
    #[Groups([self::GROUP_IN, self::GROUP_OUT, Demande::GROUP_OUT])]
    public array $optionsChoisies = []; //rempli dans le provider

    #[Groups([self::GROUP_IN, self::GROUP_OUT, Demande::GROUP_OUT])]
    public ?string $commentaire = null {
        get {
            if ($this->commentaire === null && $this->entity !== null) {
                $this->commentaire = $this->entity->getCommentaire();
            }
            return $this->commentaire ?? null;
        }
    }

    /**
     * @var Telechargement[]
     */
    #[Groups([self::GROUP_IN, self::GROUP_OUT, Demande::GROUP_OUT])]
    public ?array $piecesJustificatives = null {
        get {
            if ($this->piecesJustificatives === null && $this->entity !== null) {
                $this->piecesJustificatives = array_map(
                    fn($piece) => new Telechargement($piece),
                    $this->entity->getPiecesJustificatives()->toArray(),
                );
            }
            return $this->piecesJustificatives ?? [];
        }
    }

    #[Groups([self::GROUP_OUT, Demande::GROUP_OUT])]
    public ?DateTimeInterface $dateModification = null {
        get {
            if ($this->dateModification === null && $this->entity !== null) {
                $this->dateModification = $this->entity->getDateModification();
            }
            return $this->dateModification ?? null;
        }
    }

    /**
     * Helpers pour SF ExpressionLanguage
     */
    #[Ignore]
    public function getQuestionsIdOptions(): array
    {
        return array_map(fn($option) => $option->questionId, $this->optionsChoisies);
    }

    public function countOptionsChoisies(): int
    {
        return count($this->optionsChoisies);
    }

    public function __construct(
        private readonly ?\App\Entity\Reponse $entity = null,
    ) {}
}
