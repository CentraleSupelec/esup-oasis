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
use App\State\ParametreUI\ParametreUIProcessor;
use App\State\ParametreUI\ParametreUIProvider;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: self::COLLECTION_URI, uriVariables: [
            'uid' => new Link(fromProperty: 'uid', toProperty: 'utilisateur', fromClass: Utilisateur::class),
        ]),
        new Get(uriTemplate: self::ITEM_URI, uriVariables: ['uid', 'cle']),
        new Put(uriTemplate: self::ITEM_URI, uriVariables: ['uid', 'cle'], allowCreate: true, map: false),
        new Delete(uriTemplate: self::ITEM_URI, uriVariables: ['uid', 'cle']),
    ],
    openapi: new Operation(tags: ['Utilisateurs']),
    security: 'user.getUid() == request.attributes.get("uid")',
    provider: ParametreUIProvider::class,
    processor: ParametreUIProcessor::class,
    stateOptions: new Options(entityClass: \App\Entity\ParametreUI::class),
)]
class ParametreUI
{
    public const string COLLECTION_URI = '/utilisateurs/{uid}/parametres_ui';
    public const string ITEM_URI = '/utilisateurs/{uid}/parametres_ui/{cle}';

    #[Ignore]
    public ?int $id = null {
        get {
            if ($this->id === null && $this->entity !== null) {
                $this->id = $this->entity->getId();
            }
            return $this->id ?? null;
        }
    }

    #[Ignore]
    public ?string $uid = null {
        get {
            if ($this->uid === null && $this->entity !== null && null !== $this->entity->getUtilisateur()) {
                $this->uid = $this->entity->getUtilisateur()->getUid();
            }
            return $this->uid ?? null;
        }
    }

    #[Ignore]
    public ?Utilisateur $utilisateur = null {
        get {
            if ($this->utilisateur === null && $this->entity !== null && null !== $this->entity->getUtilisateur()) {
                $this->utilisateur = new Utilisateur($this->entity->getUtilisateur());
            }
            return $this->utilisateur ?? null;
        }
    }

    #[Ignore]
    public ?string $cle = null {
        get {
            if ($this->cle === null && $this->entity !== null) {
                $this->cle = $this->entity->getCle();
            }
            return $this->cle ?? null;
        }
    }

    public ?string $valeur = null {
        get {
            if ($this->valeur === null && $this->entity !== null) {
                $this->valeur = $this->entity->getValeur();
            }
            return $this->valeur ?? null;
        }
    }

    public function __construct(
        private readonly ?\App\Entity\ParametreUI $entity = null,
    ) {}
}
