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

use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\State\Inscription\InscriptionProvider;
use DateTimeInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: self::ITEM_URI,
            uriVariables: ['id'],
            openapi: false,
            provider: InscriptionProvider::class
        ),
    ],
)]
final class Inscription
{
    public const string COLLECTION_URI = '/inscriptions';
    public const string ITEM_URI = self::COLLECTION_URI . '/{id}';

    #[ApiProperty(identifier: true)]
    public int $id;

    #[Groups([Utilisateur::GROUP_OUT, Demande::GROUP_OUT, Utilisateur::AMENAGEMENTS_UTILISATEURS_OUT, Amenagement::GROUP_OUT])]
    public Formation $formation;

    #[Groups([Utilisateur::GROUP_OUT, Demande::GROUP_OUT, Utilisateur::AMENAGEMENTS_UTILISATEURS_OUT])]
    public DateTimeInterface $debut;
    #[Groups([Utilisateur::GROUP_OUT, Demande::GROUP_OUT, Utilisateur::AMENAGEMENTS_UTILISATEURS_OUT])]
    public DateTimeInterface $fin;

}