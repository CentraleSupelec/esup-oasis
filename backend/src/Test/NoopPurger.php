<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Test;

use ApiPlatform\HttpCache\PurgerInterface;

class NoopPurger implements PurgerInterface
{
    public function purge(array $iris): void {}

    public function getResponseHeaders(array $iris): array
    {
        return [];
    }

    // Au cas où d'autres méthodes seraient attendues par le listener ou un décorateur
    public function __invoke(): void {}

    // Méthodes fictives pour tromper d'éventuels listeners doctrine
    public function postFlush(): void {}

    public function onFlush(): void {}

    public function preUpdate(): void {}
}
