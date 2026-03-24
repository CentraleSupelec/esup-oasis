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

namespace App\Message;

use App\Entity\Utilisateur;

class CreationIntervenantMessage
{
    private string $intervenantUid;

    public function __construct(Utilisateur $intervenant)
    {
        $this->intervenantUid = $intervenant->getUid();
    }

    public function getIntervenantUid(): string
    {
        return $this->intervenantUid;
    }
}
