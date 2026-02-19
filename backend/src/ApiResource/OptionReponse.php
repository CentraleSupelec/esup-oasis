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
use App\State\OptionReponse\OptionReponseProvider;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ApiResource(operations: [
    new Get(
        uriTemplate: self::ITEM_URI,
        uriVariables: ['id', 'questionId'],
        openapi: false,
        provider: OptionReponseProvider::class,
    ),
], stateOptions: new Options(entityClass: \App\Entity\OptionReponse::class))]
class OptionReponse
{
    public const string ITEM_URI = '/questions/{questionId}/options/{id}';

    #[ApiProperty(identifier: true)]
    #[Groups([Question::GROUP_OUT, Reponse::GROUP_OUT, Demande::GROUP_OUT])]
    public ?int $id = null {
        get {
            if ($this->id === null && $this->entity !== null) {
                $this->id = $this->entity->getId();
            }
            return $this->id ?? null;
        }
    }

    #[Ignore]
    public ?int $questionId = null {
        get {
            if ($this->questionId === null && $this->entity !== null) {
                $this->questionId = $this->entity->getQuestion()->getId();
            }
            return $this->questionId ?? null;
        }
    }

    #[Groups([Question::GROUP_OUT, Reponse::GROUP_OUT, Demande::GROUP_OUT])]
    public ?string $libelle = null {
        get {
            if ($this->libelle === null && $this->entity !== null) {
                $this->libelle = $this->entity->getLibelle();
            }
            return $this->libelle ?? null;
        }
    }

    #[Groups([Question::GROUP_OUT, Reponse::GROUP_OUT])]
    public ?array $questionsLiees = null {
        get {
            if ($this->questionsLiees === null && $this->entity !== null) {
                $this->questionsLiees = array_map(
                    fn($entity) => new Question($entity),
                    $this->entity->getQuestionsLiees()->toArray(),
                );
            }
            return $this->questionsLiees ?? [];
        }
    }

    public function __construct(
        private readonly ?\App\Entity\OptionReponse $entity = null,
    ) {}

    public static function fromReference(mixed $item): self
    {
        //toutes les classes en entrée ont id et libellé, pas de support des questions liées
        $resource = new self();
        $resource->id = $item->getId();
        $resource->libelle = $item->getLibelle();
        $resource->questionsLiees = [];

        return $resource;
    }
}
