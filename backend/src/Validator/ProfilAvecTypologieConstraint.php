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

namespace App\Validator;

use Attribute;
use Symfony\Component\Validator\Constraint;

#[Attribute]
class ProfilAvecTypologieConstraint extends Constraint
{
    public string $message = "Ce profil n'attend pas de typologie";
    public string $messageObligatoire = 'Spécifier la typologie est obligatoire pour ce profil';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}
