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
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use App\Filter\PieceJointeBeneficiaireUidFilter;
use App\State\PieceJointeBeneficiaire\PieceJointeBeneficiaireProcessor;
use App\State\PieceJointeBeneficiaire\PieceJointeBeneficiaireProvider;
use DateTimeInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: self::COLLECTION_URI, uriVariables: ['uid']),
        new Get(uriTemplate: self::ITEM_URI, uriVariables: ['uid', 'id']),
        new Post(uriTemplate: self::COLLECTION_URI, uriVariables: ['uid'], read: false, map: false),
        new Delete(uriTemplate: self::ITEM_URI, uriVariables: ['uid', 'id']),
    ],
    normalizationContext: ['groups' => [self::GROUP_OUT]],
    denormalizationContext: ['groups' => [self::GROUP_IN]],
    openapi: new Operation(tags: ['Utilisateurs']),
    security: "is_granted('ROLE_GESTIONNAIRE') or request.attributes.get('uid') == user.getUid()",
    provider: PieceJointeBeneficiaireProvider::class,
    processor: PieceJointeBeneficiaireProcessor::class,
    stateOptions: new Options(entityClass: \App\Entity\PieceJointeBeneficiaire::class),
)]
#[ApiFilter(PieceJointeBeneficiaireUidFilter::class)]
class PieceJointeBeneficiaire
{
    public const string COLLECTION_URI = '/beneficiaires/{uid}/pieces_jointes';
    public const string ITEM_URI = '/beneficiaires/{uid}/pieces_jointes/{id}';

    public const string GROUP_OUT = 'piece_beneficiaire:out';
    public const string GROUP_IN = 'piece_beneficiaire:in';

    #[Ignore]
    public ?string $uid = null {
        get {
            if ($this->uid === null && $this->entity !== null) {
                $this->uid = $this->entity->getBeneficiaire()->getUid();
            }
            return $this->uid ?? null;
        }
    }

    #[Ignore]
    public ?int $id = null {
        get {
            if ($this->id === null && $this->entity !== null) {
                $this->id = $this->entity->getId();
            }
            return $this->id ?? null;
        }
    }

    #[Groups([self::GROUP_IN, self::GROUP_OUT])]
    public ?string $libelle = null {
        get {
            if ($this->libelle === null && $this->entity !== null) {
                $this->libelle = $this->entity->getLibelle();
            }
            return $this->libelle ?? null;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?DateTimeInterface $dateDepot = null {
        get {
            if ($this->dateDepot === null && $this->entity !== null) {
                $this->dateDepot = $this->entity->getDateDepot();
            }
            return $this->dateDepot ?? null;
        }
    }

    #[Groups([self::GROUP_OUT])]
    public ?Utilisateur $utilisateurCreation = null {
        get {
            if (
                $this->utilisateurCreation === null
                && $this->entity !== null
                && null !== $this->entity->getUtilisateurCreation()
            ) {
                $this->utilisateurCreation = new Utilisateur($this->entity->getUtilisateurCreation());
            }
            return $this->utilisateurCreation ?? null;
        }
    }

    #[Groups([self::GROUP_IN, self::GROUP_OUT])]
    public ?Telechargement $fichier = null {
        get {
            if ($this->fichier === null && $this->entity !== null && $this->entity->getFichier() !== null) {
                $this->fichier = new Telechargement($this->entity->getFichier());
            }
            return $this->fichier ?? null;
        }
    }

    public function __construct(
        private readonly ?\App\Entity\PieceJointeBeneficiaire $entity = null,
    ) {}
}
