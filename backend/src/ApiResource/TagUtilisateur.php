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

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Utilisateur\DeleteTagUtilisateurProcessor;
use App\State\Utilisateur\PostTagUtilisateurProcessor;
use App\State\Utilisateur\TagUtilisateurProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: self::COLLECTION_URI, uriVariables: ['uid']),
        new Get(uriTemplate: self::ITEM_URI, uriVariables: ['uid', 'id']),
        new Post(
            uriTemplate: self::COLLECTION_URI,
            uriVariables: ['uid'],
            read: false,
            processor: PostTagUtilisateurProcessor::class,
        ),
        new Delete(
            uriTemplate: self::ITEM_URI,
            uriVariables: ['uid', 'id'],
            processor: DeleteTagUtilisateurProcessor::class,
        ),
    ],
    normalizationContext: ['groups' => [self::GROUP_OUT]],
    denormalizationContext: ['groups' => [self::GROUP_IN]],
    openapi: new Operation(tags: ['Utilisateurs']),
    paginationEnabled: false,
    provider: TagUtilisateurProvider::class,
)]
class TagUtilisateur
{
    public const string COLLECTION_URI = '/utilisateurs/{uid}/tags';
    public const string ITEM_URI = '/utilisateurs/{uid}/tags/{id}';
    public const string GROUP_OUT = 'tag_utilisateur:out';
    public const string GROUP_IN = 'tag_utilisateur:in';

    public ?Utilisateur $utilisateur;
    public ?string $uid;
    public ?int $id = null;

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\NotNull]
    public ?Tag $tag;

    public function __construct(?Utilisateur $utilisateur = null, ?Tag $tag = null)
    {
        $this->utilisateur = $utilisateur;
        $this->tag = $tag;
        $this->uid = $utilisateur?->uid;
        $this->id = $tag?->id;
    }
}
