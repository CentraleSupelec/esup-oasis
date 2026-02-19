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

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Filter\InterventionForfaitNomIntervenantOrderFilter;
use App\Filter\NestedUtilisateurFilter;
use App\Filter\NomIntervenantFilter;
use App\State\InterventionForfait\InterventionForfaitProcessor;
use App\State\InterventionForfait\InterventionForfaitProvider;
use DateTimeInterface;
use Symfony\Component\ObjectMapper\Attribute\Map;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new Get(uriTemplate: self::ITEM_URI, uriVariables: ['id']),
        new GetCollection(uriTemplate: self::COLLECTION_URI),
        new Post(
            uriTemplate: self::COLLECTION_URI,
            securityPostDenormalize: "is_granted('" . self::AJOUTER_INTERVENTION . "', object)",
        ),
        new Patch(
            uriTemplate: self::ITEM_URI,
            uriVariables: ['id'],
            security: "is_granted('" . self::MODIFIER_INTERVENTION . "', [previous_object, object])",
        ),
        new Delete(
            uriTemplate: self::ITEM_URI,
            uriVariables: ['id'],
            security: "is_granted('" . self::SUPPRIMER_INTERVENTION . "', object)",
        ),
    ],
    normalizationContext: ['groups' => [self::GROUP_OUT]],
    denormalizationContext: ['groups' => [self::GROUP_IN]],
    order: ['periode.debut' => 'ASC'],
    provider: InterventionForfaitProvider::class,
    processor: InterventionForfaitProcessor::class,
    stateOptions: new Options(entityClass: \App\Entity\InterventionForfait::class),
)]
#[ApiFilter(SearchFilter::class, properties: ['periode', 'type'])]
#[ApiFilter(NestedUtilisateurFilter::class, properties: [
    'intervenant' => 'intervenant.utilisateur',
    'utilisateurCreation' => 'utilisateurCreation',
])]
#[ApiFilter(NomIntervenantFilter::class)]
#[ApiFilter(InterventionForfaitNomIntervenantOrderFilter::class, properties: ['intervenant.utilisateur.nom'])]
#[ApiFilter(DateFilter::class, properties: ['periode.debut', 'periode.fin'])]
#[Assert\Expression(expression: 'this.type.forfait == true', message: "Type d'événement incompatible")]
class InterventionForfait
{
    public const string COLLECTION_URI = '/interventions_forfait';
    public const string ITEM_URI = self::COLLECTION_URI . '/{id}';
    public const string GROUP_IN = 'forfait:in';
    public const string GROUP_OUT = 'forfait:out';
    public const string MODIFIER_INTERVENTION = 'MODIFIER_INTERVENTION';
    public const string SUPPRIMER_INTERVENTION = 'SUPPRIMER_INTERVENTION';
    public const string AJOUTER_INTERVENTION = 'AJOUTER_INTERVENTION';

    #[ApiProperty(identifier: true)]
    #[Groups([self::GROUP_OUT])]
    public ?int $id = null {
        get {
            if ($this->id === null && $this->entity !== null) {
                $this->id = $this->entity->getId();
            }
            return $this->id ?? null;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\NotNull]
    public ?Utilisateur $intervenant = null {
        get {
            if ($this->intervenant === null && $this->entity !== null && $this->entity->getIntervenant()) {
                $this->intervenant = new Utilisateur($this->entity->getIntervenant()->getUtilisateur());
            }
            return $this->intervenant;
        }
    }

    /**
     * @var Utilisateur[]
     */
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\All([new Assert\Type(Utilisateur::class)])]
    public array $beneficiaires = [] {
        get {
            if (empty($this->beneficiaires) && $this->entity !== null) {
                $this->beneficiaires = array_map(
                    fn($b) => new Utilisateur($b->getUtilisateur()),
                    $this->entity->getBeneficiaires()->toArray(),
                );
            }
            return $this->beneficiaires ?? [];
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\NotNull]
    public ?PeriodeRH $periode = null {
        get {
            if ($this->periode === null && $this->entity !== null && $this->entity->getPeriode()) {
                $this->periode = new PeriodeRH($this->entity->getPeriode());
            }
            return $this->periode;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\NotNull]
    public ?TypeEvenement $type = null {
        get {
            if ($this->type === null && $this->entity !== null && $this->entity->getType()) {
                $this->type = new TypeEvenement($this->entity->getType());
            }
            return $this->type;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\NotBlank]
    #[Assert\Length(max: 5)]
    #[Assert\Type('numeric')]
    #[Assert\LessThan(10000)] //decimal(5,1)
    #[Assert\Positive]
    public ?string $heures = null {
        get {
            if ($this->heures === null && $this->entity !== null) {
                $this->heures = $this->entity->getHeures() ?? '0';
            }
            return $this->heures;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?DateTimeInterface $dateCreation = null {
        get {
            if ($this->dateCreation === null && $this->entity !== null) {
                $this->dateCreation = $this->entity->getDateCreation();
            }
            return $this->dateCreation ?? null;
        }
    }
    #[Groups([self::GROUP_OUT])]
    public ?Utilisateur $utilisateurCreation = null {
        get {
            if (
                $this->utilisateurCreation === null
                && $this->entity !== null
                && $this->entity->getUtilisateurCreation()
            ) {
                $this->utilisateurCreation = new Utilisateur($this->entity->getUtilisateurCreation());
            }
            return $this->utilisateurCreation;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?DateTimeInterface $dateModification = null {
        get {
            if ($this->dateModification === null && $this->entity !== null) {
                $this->dateModification = $this->entity->getDateModification();
            }
            return $this->dateModification ?? null;
        }
    }
    #[Groups([self::GROUP_OUT])]
    public ?Utilisateur $utilisateurModification = null {
        get {
            if (
                $this->utilisateurModification === null
                && $this->entity !== null
                && $this->entity->getUtilisateurModification()
            ) {
                $this->utilisateurModification = new Utilisateur($this->entity->getUtilisateurModification());
            }
            return $this->utilisateurModification ?? null;
        }
    }

    public function __construct(
        private readonly ?\App\Entity\InterventionForfait $entity = null,
    ) {}
}
