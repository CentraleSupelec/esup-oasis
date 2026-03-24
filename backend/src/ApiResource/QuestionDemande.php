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
use ApiPlatform\Metadata\Get;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(operations: [new Get()], openapi: false)]
class QuestionDemande
{
    #[Groups([Demande::GROUP_OUT])]
    public ?int $id = null;
    #[Groups([Demande::GROUP_OUT])]
    public string $libelle;
    #[Groups([Demande::GROUP_OUT])]
    public ?string $aide;
    #[Groups([Demande::GROUP_OUT])]
    public string $typeReponse;
    #[Groups([Demande::GROUP_OUT])]
    public bool $obligatoire;
    #[Groups([Demande::GROUP_OUT])]
    public bool $choixMultiple;
    #[Groups([Demande::GROUP_OUT])]
    public ?ReponseDemande $reponse;

    public ?string $tableOptions = null;

    #[Groups([Demande::GROUP_OUT])]
    public function getQuestion(): string
    {
        return Question::COLLECTION_URI . '/' . $this->id;
    }
}
