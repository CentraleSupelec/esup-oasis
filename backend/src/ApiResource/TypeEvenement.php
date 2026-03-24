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

use ApiPlatform\Doctrine\Orm\Filter\BooleanFilter;
use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\TypeEvenement\TypeEvenementProcessor;
use App\State\TypeEvenement\TypeEvenementProvider;
use Symfony\Component\ObjectMapper\Attribute\Map;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: self::COLLECTION_URI,
            openapi: new Operation(
                tags: ['Referentiel'],
                summary: "Liste des types d'événements",
                description: "Retourne la liste des types d'événements",
            ),
        ),
        new Get(
            uriTemplate: self::ITEM_URI,
            uriVariables: ['id' => 'id'],
            openapi: new Operation(
                tags: ['Referentiel'],
                summary: "Détail d'un types d'événements",
                description: "Retourne le détail du type d'événements demandé",
            ),
        ),
        new Post(uriTemplate: self::COLLECTION_URI, security: "is_granted('ROLE_ADMIN')", map: false),
        new Patch(uriTemplate: self::ITEM_URI, security: "is_granted('ROLE_ADMIN')", map: false),
    ],
    normalizationContext: ['groups' => self::GROUP_OUT],
    denormalizationContext: ['groups' => self::GROUP_IN],
    openapi: new Operation(tags: ['Referentiel']),
    order: ['libelle' => 'ASC '],
    provider: TypeEvenementProvider::class,
    processor: TypeEvenementProcessor::class,
    stateOptions: new Options(entityClass: \App\Entity\TypeEvenement::class),
)]
#[ApiFilter(BooleanFilter::class, properties: ['forfait'])]
final class TypeEvenement
{
    public const string ITEM_URI = '/types_evenements/{id}';
    public const string COLLECTION_URI = '/types_evenements';
    public const string GROUP_OUT = 'typesEvenements:out';
    public const string GROUP_IN = 'typesEvenements:in';

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
    #[Assert\NotBlank]
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    public string $libelle {
        get {
            if (!isset($this->libelle) && $this->entity !== null) {
                $this->libelle = $this->entity->getLibelle() ?? '';
            }
            return $this->libelle;
        }
    }
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    public bool $actif = true {
        get {
            if ($this->entity !== null) {
                return $this->entity->isActif() ?? true;
            }
            return $this->actif;
        }
    }
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    public ?string $couleur = null {
        get {
            if ($this->couleur === null && $this->entity !== null) {
                $this->couleur = $this->entity->getCouleur();
            }
            return $this->couleur ?? null;
        }
    }
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    public bool $visibleParDefaut = true {
        get {
            if ($this->entity !== null) {
                return $this->entity->isVisibleParDefaut() ?? true;
            }
            return $this->visibleParDefaut;
        }
    }
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    public bool $avecValidation = false {
        get {
            if ($this->entity !== null) {
                return $this->entity->isAvecValidation() ?? false;
            }
            return $this->avecValidation;
        }
    }

    /**
     * @var TauxHoraire[]
     */
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\All([new Assert\Type(TauxHoraire::class)])]
    public array $tauxHoraires = [] {
        get {
            if (empty($this->tauxHoraires) && $this->entity !== null) {
                $this->tauxHoraires = array_map(
                    fn($entity) => new TauxHoraire($entity),
                    $this->entity->getTauxHoraires()->toArray(),
                );
            }
            return $this->tauxHoraires;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?TauxHoraire $tauxActif = null {
        get {
            if ($this->tauxActif === null && $this->entity !== null) {
                $actif = $this->entity->getTauxHoraireActif();
                $this->tauxActif = $actif ? new TauxHoraire($actif) : null;
            }
            return $this->tauxActif;
        }
    }

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    public bool $forfait = false {
        get {
            if ($this->entity !== null) {
                return $this->entity->isForfait();
            }
            return $this->forfait;
        }
    }

    public function __construct(
        private readonly ?\App\Entity\TypeEvenement $entity = null,
    ) {}
}
