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
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\OpenApi\Model\Operation;
use App\State\Parametre\ParametreProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new Get(uriTemplate: self::ITEM_URI, uriVariables: ['cle']),
        new GetCollection(uriTemplate: self::COLLECTION_URI),
    ],
    normalizationContext: ['groups' => [self::GROUP_OUT]],
    denormalizationContext: ['groups' => [self::GROUP_IN]],
    openapi: new Operation(tags: ['Referentiel']),
    order: ['cle' => 'ASC '],
    security: 'is_granted("' . \App\Entity\Utilisateur::ROLE_GESTIONNAIRE . '")',
    provider: ParametreProvider::class,
    stateOptions: new Options(entityClass: \App\Entity\Parametre::class),
)]
class Parametre
{
    public const string ITEM_URI = '/parametres/{cle}';
    public const string COLLECTION_URI = '/parametres';
    public const string GROUP_IN = 'param:in';
    public const string GROUP_OUT = 'param:out';

    #[ApiProperty(identifier: true)]
    #[Groups(self::GROUP_OUT)]
    public ?string $cle = null {
        get {
            if ($this->cle === null && $this->entity !== null) {
                $this->cle = $this->entity->getCle();
            }
            return $this->cle ?? null;
        }
    }

    #[Groups(self::GROUP_OUT)]
    public ?bool $fichier = null {
        get {
            if ($this->fichier === null && $this->entity !== null) {
                $this->fichier = $this->entity->isFichier();
            }
            return $this->fichier ?? false;
        }
    }

    /**
     * @var ValeurParametre[]
     */
    #[Groups([self::GROUP_IN, self::GROUP_OUT])]
    #[ApiProperty(readableLink: false, writableLink: false)]
    public ?array $valeurs = null {
        get {
            if ($this->valeurs === null && $this->entity !== null) {
                $this->valeurs = array_map(
                    fn($val) => new ValeurParametre($val),
                    $this->entity->getValeursParametres()->toArray(),
                );
            }
            return $this->valeurs ?? [];
        }
    }

    /**
     * @var ValeurParametre[]
     */
    #[Groups(self::GROUP_OUT)]
    public ?array $valeursCourantes = null {
        get {
            if ($this->valeursCourantes === null && $this->entity !== null) {
                $this->valeursCourantes = array_map(
                    fn($val) => new ValeurParametre($val),
                    $this->entity->getValeurCourante(multiple: true),
                );
            }
            return $this->valeursCourantes ?? [];
        }
    }

    public function __construct(
        private readonly ?\App\Entity\Parametre $entity = null,
    ) {
        //dd($entity);
    }
}
