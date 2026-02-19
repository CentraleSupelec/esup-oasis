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
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Put;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Commission\MembreCommissionDeleteProcessor;
use App\State\Commission\MembreCommissionProvider;
use App\State\Commission\MembreCommissionPutProcessor;
use App\Validator\RoleCommissionValideConstraint;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: self::COLLECTION_URI,
            uriVariables: [
                'commissionId' => new Link(fromProperty: 'id', toProperty: 'commission', fromClass: Commission::class),
            ],
            map: false,
        ),
        new Get(uriTemplate: self::ITEM_URI, uriVariables: [
            'commissionId' => new Link(fromProperty: 'id', toProperty: 'commission', fromClass: Commission::class),
            'uid' => new Link(fromProperty: 'uid', toProperty: 'utilisateur', fromClass: Utilisateur::class),
        ]),
        new Put(
            uriTemplate: self::ITEM_URI,
            uriVariables: [
                'commissionId' => new Link(fromProperty: 'id', toProperty: 'commission', fromClass: Commission::class),
                'uid' => new Link(fromProperty: 'uid', toProperty: 'utilisateur', fromClass: Utilisateur::class),
            ],
            denormalizationContext: ['groups' => [self::GROUP_IN]],
            processor: MembreCommissionPutProcessor::class,
            allowCreate: true,
        ),
        new Delete(
            uriTemplate: self::ITEM_URI,
            uriVariables: [
                'commissionId' => new Link(fromProperty: 'id', toProperty: 'commission', fromClass: Commission::class),
                'uid' => new Link(fromProperty: 'uid', toProperty: 'utilisateur', fromClass: Utilisateur::class),
            ],
            processor: MembreCommissionDeleteProcessor::class,
        ),
    ],
    normalizationContext: ['groups' => [self::GROUP_OUT]],
    openapi: new Operation(tags: ['Demandes', 'Utilisateurs']),
    provider: MembreCommissionProvider::class,
    stateOptions: new Options(entityClass: \App\Entity\MembreCommission::class),
)]
class MembreCommission
{
    public const string COLLECTION_URI = '/commissions/{commissionId}/membres';
    public const string ITEM_URI = '/commissions/{commissionId}/membres/{uid}';
    public const string GROUP_IN = 'membre_commission:in';
    public const string GROUP_OUT = 'membre_commission:out';

    #[Ignore]
    public ?int $id = null {
        get {
            if ($this->id === null && $this->entity !== null) {
                $this->id = $this->entity->getId();
            }
            return $this->id ?? null;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?Utilisateur $utilisateur = null {
        get {
            if ($this->utilisateur === null && $this->entity !== null && $this->entity->getUtilisateur() !== null) {
                $this->utilisateur = new Utilisateur($this->entity->getUtilisateur());
            }
            return $this->utilisateur ?? null;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?Commission $commission = null {
        get {
            if ($this->commission === null && $this->entity !== null && $this->entity->getCommission() !== null) {
                $this->commission = new Commission($this->entity->getCommission());
            }
            return $this->commission ?? null;
        }
    }

    /**
     * @var string[]
     */
    #[Groups([self::GROUP_IN, self::GROUP_OUT])]
    #[RoleCommissionValideConstraint]
    public ?array $roles = null {
        get {
            if ($this->roles === null && $this->entity !== null) {
                $this->roles = $this->entity->getRoles();
            }
            return $this->roles ?? [];
        }
    }

    public function __construct(
        private readonly ?\App\Entity\MembreCommission $entity = null,
    ) {}
}
