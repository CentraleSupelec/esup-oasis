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

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\OpenApi\Model\Operation;
use App\Filter\CaseInsensitiveOrderFilter;
use App\Filter\InscriptionEnCoursFilter;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new Get(uriTemplate: self::ITEM_URI, uriVariables: ['id']),
        new GetCollection(uriTemplate: self::COLLECTION_URI),
    ],
    openapi: new Operation(tags: ['Referentiel']),
    stateOptions: new Options(entityClass: \App\Entity\Formation::class),
)]
#[ApiFilter(SearchFilter::class, properties: ['composante'])]
#[ApiFilter(CaseInsensitiveOrderFilter::class, properties: ['libelle'])]
#[ApiFilter(InscriptionEnCoursFilter::class)]
final class Formation
{
    public const string COLLECTION_URI = '/formations';
    public const string ITEM_URI = self::COLLECTION_URI . '/{id}';

    #[ApiProperty(identifier: true)]
    public int $id {
        get {
            if (!isset($this->id) && $this->entity !== null) {
                $this->id = $this->entity->getId();
            }
            return $this->id;
        }
    }

    #[Groups([
        Utilisateur::GROUP_OUT,
        Demande::GROUP_OUT,
        Utilisateur::AMENAGEMENTS_UTILISATEURS_OUT,
        Amenagement::GROUP_OUT,
    ])]
    public Composante $composante {
        get {
            if (!isset($this->composante) && $this->entity !== null && $this->entity->getComposante()) {
                $this->composante = new Composante($this->entity->getComposante());
            }
            return $this->composante;
        }
    }

    #[Groups([
        Utilisateur::GROUP_OUT,
        Demande::GROUP_OUT,
        Utilisateur::AMENAGEMENTS_UTILISATEURS_OUT,
        Amenagement::GROUP_OUT,
    ])]
    public string $libelle {
        get {
            if (!isset($this->libelle) && $this->entity !== null) {
                $this->libelle = $this->entity->getLibelle() ?? '';
            }
            return $this->libelle;
        }
    }

    #[Groups([Utilisateur::GROUP_OUT])]
    public string $codeExterne {
        get {
            if (!isset($this->codeExterne) && $this->entity !== null) {
                $this->codeExterne = $this->entity->getCodeExterne() ?? '';
            }
            return $this->codeExterne;
        }
    }

    #[Groups([Utilisateur::GROUP_OUT])]
    public ?string $niveau = null {
        get {
            if ($this->niveau === null && $this->entity !== null) {
                $this->niveau = $this->entity->getNiveau();
            }
            return $this->niveau ?? null;
        }
    }

    #[Groups([Utilisateur::GROUP_OUT])]
    public ?string $discipline = null {
        get {
            if ($this->discipline === null && $this->entity !== null) {
                $this->discipline = $this->entity->getDiscipline();
            }
            return $this->discipline ?? null;
        }
    }

    #[Groups([Utilisateur::GROUP_OUT])]
    public ?string $diplome = null {
        get {
            if ($this->diplome === null && $this->entity !== null) {
                $this->diplome = $this->entity->getDiplome();
            }
            return $this->diplome ?? null;
        }
    }

    public function __construct(
        private readonly ?\App\Entity\Formation $entity = null,
    ) {}
}
