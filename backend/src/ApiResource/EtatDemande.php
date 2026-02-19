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
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\OpenApi\Model\Operation;

#[ApiResource(
    operations: [
        new Get(uriTemplate: self::ITEM_URI),
        new GetCollection(uriTemplate: self::COLLECTION_URI),
    ],
    openapi: new Operation(tags: ['Referentiel']),
    stateOptions: new Options(entityClass: \App\Entity\EtatDemande::class),
)]
final class EtatDemande
{
    public const string COLLECTION_URI = '/etats_demandes';
    public const string ITEM_URI = self::COLLECTION_URI . '/{id}';

    public ?int $id {
        get {
            if (!isset($this->id) && $this->entity !== null) {
                return $this->entity->getId();
            }
            return $this->id ?? null;
        }
    }

    public string $libelle {
        get {
            if (!isset($this->libelle) && $this->entity !== null) {
                return $this->entity->getLibelle() ?? '';
            }
            return $this->libelle;
        }
    }

    public function __construct(
        private ?\App\Entity\EtatDemande $entity = null,
    ) {}
}
