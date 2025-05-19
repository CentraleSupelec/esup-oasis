<?php

/*
 * Copyright (c) 2024. Esup - Université de Bordeaux.
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
use App\State\Formation\FormationProvider;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: self::ITEM_URI,
            uriVariables: ['id']
        ),
        new GetCollection(
            uriTemplate: self::COLLECTION_URI
        ),
    ],
    openapi: new Operation(tags: ['Referentiel']),
    provider: FormationProvider::class,
    stateOptions: new Options(entityClass: \App\Entity\Formation::class)
)]
#[ApiFilter(SearchFilter::class, properties: ['composante'])]
#[ApiFilter(CaseInsensitiveOrderFilter::class, properties: ['libelle'])]
#[ApiFilter(InscriptionEnCoursFilter::class)]
final class Formation
{
    public const string COLLECTION_URI = '/formations';
    public const string ITEM_URI = self::COLLECTION_URI . '/{id}';

    #[ApiProperty(identifier: true)]
    public int $id;

    #[Groups([Utilisateur::GROUP_OUT, Demande::GROUP_OUT, Utilisateur::AMENAGEMENTS_UTILISATEURS_OUT, Amenagement::GROUP_OUT])]
    public Composante $composante;

    #[Groups([Utilisateur::GROUP_OUT, Demande::GROUP_OUT, Utilisateur::AMENAGEMENTS_UTILISATEURS_OUT, Amenagement::GROUP_OUT])]
    public string $libelle;

    #[Groups([Utilisateur::GROUP_OUT])]
    public string $codeExterne;

    #[Groups([Utilisateur::GROUP_OUT])]
    public ?string $niveau = null;

    #[Groups([Utilisateur::GROUP_OUT])]
    public ?string $discipline = null;

    #[Groups([Utilisateur::GROUP_OUT])]
    public ?string $diplome = null;

}