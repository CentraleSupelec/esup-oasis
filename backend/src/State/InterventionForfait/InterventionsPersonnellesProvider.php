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

namespace App\State\InterventionForfait;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;

readonly class InterventionsPersonnellesProvider implements ProviderInterface
{
    public function __construct(
        private InterventionForfaitProvider $provider,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        /**
         * On appelle simplement le provider d'origine en lui passant le filtre utilisateur en dur
         */
        //todo: clean version. Maybe. Some day.
        $utilisateur = '/utilisateurs/' . $uriVariables['uid'];
        $context['filters']['intervenant'] = $utilisateur;

        return $this->provider->provide($operation, [], $context);
    }
}
