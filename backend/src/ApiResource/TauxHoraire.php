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

use ApiPlatform\Doctrine\Orm\State\Options;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\OpenApi\Model\Operation;
use App\Filter\TauxHoraireDateFilter;
use App\State\TauxHoraire\TauxHoraireCollectionProvider;
use App\State\TauxHoraire\TauxHoraireProcessor;
use App\State\TauxHoraire\TauxHoraireProvider;
use DateTimeInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: self::COLLECTION_URI,
            uriVariables: [
                'typeId' => new Link(fromProperty: 'id', toProperty: 'typeEvenement', fromClass: TypeEvenement::class,),
            ],
            provider: TauxHoraireCollectionProvider::class,
        ),
        new Get(
            uriTemplate: self::ITEM_URI,
            uriVariables: [
                'typeId', 'id',
            ],
        ),
        new Post(
            uriTemplate: self::COLLECTION_URI,
            uriVariables: [
                'typeId',
            ],
            security: "is_granted('ROLE_ADMIN')",
            read: false,
        ),
        new Patch(
            uriTemplate: self::ITEM_URI,
            uriVariables: [
                'typeId', 'id',
            ],
            security: "is_granted('ROLE_ADMIN')",
        ),
        new Delete(
            uriTemplate: self::ITEM_URI,
            uriVariables: [
                'typeId', 'id',
            ],
            security: "is_granted('ROLE_ADMIN')",
        ),
    ],

    normalizationContext: ['groups' => [self::GROUP_OUT]],
    denormalizationContext: ['groups' => [self::GROUP_IN]],
    openapi: new Operation(tags: ['Referentiel']),
    order: ['debut' => 'DESC '],
    security: "is_granted('ROLE_PLANIFICATEUR') or is_granted('ROLE_INTERVENANT')",
    provider: TauxHoraireProvider::class,
    processor: TauxHoraireProcessor::class,
    stateOptions: new Options(entityClass: \App\Entity\TauxHoraire::class)
)]
#[ApiFilter(TauxHoraireDateFilter::class)]
class TauxHoraire
{
    public const string COLLECTION_URI = '/types_evenements/{typeId}/taux';
    public const string ITEM_URI = '/types_evenements/{typeId}/taux/{id}';
    public const string GROUP_OUT = 'taux:out';
    public const string GROUP_IN = 'taux:in';

    #[ApiProperty(identifier: true)]
    #[Groups([self::GROUP_OUT, ServicesFaits::GROUP_OUT, ActiviteBeneficiaire::OUT, ActiviteIntervenant::OUT])]
    public ?int $id = null;

    //copie juste pour gérer facilement les IRI
    public int $typeId;
    public TypeEvenement $typeEvenement;

    #[Assert\NotBlank]
    #[Assert\Length(max: 5)]
    #[Assert\Type('numeric')]
    #[Assert\LessThan(1000)] //decimal(5,2)
    #[Assert\Positive]
    #[Groups([self::GROUP_OUT, self::GROUP_IN, ServicesFaits::GROUP_OUT, ActiviteBeneficiaire::OUT, ActiviteIntervenant::OUT])]
    public string $montant;

    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    public DateTimeInterface $debut;
    #[Groups([self::GROUP_OUT, self::GROUP_IN])]
    #[Assert\GreaterThan(propertyPath: 'debut')]
    public ?DateTimeInterface $fin = null;
}