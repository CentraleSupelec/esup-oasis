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
class EtapeDemandeEtudiant
{
    #[Groups([Demande::GROUP_OUT])]
    public int $id;

    #[Groups([Demande::GROUP_OUT])]
    public string $libelle;
    #[Groups([Demande::GROUP_OUT])]
    public int $ordre;

    /**
     * @var QuestionDemande[]
     */
    #[Groups([Demande::GROUP_OUT])]
    public array $questions;

    #[Groups([Demande::GROUP_OUT])]
    public function getEtape(): string
    {
        return EtapeDemande::COLLECTION_URI . '/' . $this->id;
    }
}
