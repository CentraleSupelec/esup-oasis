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

readonly class BilanActiviteDemandeMessage
{
    public function __construct(
        private int $idBilan,
    ) {}

    public function getIdBilan(): int
    {
        return $this->idBilan;
    }
}
