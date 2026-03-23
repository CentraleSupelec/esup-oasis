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
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use App\Filter\PeriodeEnvoyeeFilter;
use App\Filter\PeriodeIntervenantFilter;
use App\State\PeriodeRH\PeriodeProcessor;
use App\State\PeriodeRH\PeriodeProvider;
use App\Validator\PeriodesSansChevauchementConstraint;
use DateTimeInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: self::COLLECTION_URI),
        new Get(uriTemplate: self::ITEM_URI, uriVariables: ['id']),
        new Post(uriTemplate: self::COLLECTION_URI, security: "is_granted('ROLE_ADMIN')", map: false),
        new Patch(uriTemplate: self::ITEM_URI, security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => [self::GROUP_OUT]],
    denormalizationContext: ['groups' => [self::GROUP_IN]],
    openapi: new Operation(tags: ['Referentiel']),
    order: ['debut' => 'DESC '],
    security: "is_granted('ROLE_PLANIFICATEUR') or is_granted('ROLE_INTERVENANT')",
    provider: PeriodeProvider::class,
    processor: PeriodeProcessor::class,
    stateOptions: new Options(entityClass: \App\Entity\PeriodeRH::class),
)]
#[ApiFilter(OrderFilter::class, properties: ['debut'])]
#[ApiFilter(DateFilter::class, properties: ['butoir'])]
#[PeriodesSansChevauchementConstraint]
#[ApiFilter(PeriodeIntervenantFilter::class)]
#[ApiFilter(PeriodeEnvoyeeFilter::class)]
final class PeriodeRH
{
    public const string COLLECTION_URI = '/periodes';
    public const string ITEM_URI = '/periodes/{id}';
    public const string GROUP_IN = 'periode:in';
    public const string GROUP_OUT = 'periode:out';

    #[Groups([self::GROUP_OUT, ServicesFaits::GROUP_OUT])]
    public ?int $id = null {
        get {
            if ($this->id === null && $this->entity !== null) {
                $this->id = $this->entity->getId();
            }
            return $this->id ?? null;
        }
    }

    #[Groups([self::GROUP_IN, self::GROUP_OUT, ServicesFaits::GROUP_OUT])]
    #[Assert\NotBlank]
    public ?DateTimeInterface $debut = null {
        get {
            if ($this->debut === null && $this->entity !== null) {
                $this->debut = $this->entity->getDebut();
            }
            return $this->debut ?? null;
        }
    }

    #[Groups([self::GROUP_IN, self::GROUP_OUT, ServicesFaits::GROUP_OUT])]
    #[Assert\NotBlank]
    #[Assert\GreaterThan(propertyPath: 'debut')]
    public ?DateTimeInterface $fin = null {
        get {
            if ($this->fin === null && $this->entity !== null) {
                $this->fin = $this->entity->getFin();
            }
            return $this->fin ?? null;
        }
    }

    #[Groups([self::GROUP_IN, self::GROUP_OUT])]
    #[Assert\NotBlank]
    #[Assert\GreaterThan(propertyPath: 'debut')]
    #[Assert\LessThanOrEqual(propertyPath: 'fin')]
    public ?DateTimeInterface $butoir = null {
        get {
            if ($this->butoir === null && $this->entity !== null) {
                $this->butoir = $this->entity->getButoir();
            }
            return $this->butoir ?? null;
        }
    }

    #[Groups([self::GROUP_IN, self::GROUP_OUT])]
    public ?bool $envoyee = null {
        get {
            if ($this->envoyee === null && $this->entity !== null) {
                $this->envoyee = $this->entity->getDateEnvoi() !== null;
            }
            return $this->envoyee ?? false;
        }
    }

    #[Groups([self::GROUP_OUT, ServicesFaits::GROUP_OUT])]
    public ?DateTimeInterface $dateEnvoi = null {
        get {
            if ($this->dateEnvoi === null && $this->entity !== null) {
                $this->dateEnvoi = $this->entity->getDateEnvoi();
            }
            return $this->dateEnvoi ?? null;
        }
    }

    #[Groups([self::GROUP_OUT, ServicesFaits::GROUP_OUT])]
    public ?Utilisateur $utilisateurEnvoi = null {
        get {
            if ($this->utilisateurEnvoi === null && $this->entity !== null && $this->entity->getUtilisateurEnvoi()) {
                $this->utilisateurEnvoi = new Utilisateur($this->entity->getUtilisateurEnvoi());
            }
            return $this->utilisateurEnvoi ?? null;
        }
    }

    public function __construct(
        private readonly ?\App\Entity\PeriodeRH $entity = null,
    ) {}
}
