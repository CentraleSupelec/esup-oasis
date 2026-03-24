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

use App\ApiResource\Utilisateur;
use DateTimeInterface;

trait UtilisateurBeneficiaireValidatorTrait
{
    protected function utilisateurValide(Utilisateur $utilisateur, DateTimeInterface $dateObservee): bool
    {
        foreach ($utilisateur->profils ?? [] as $profil) {
            if ($profil->debut <= $dateObservee && (null === $profil->fin || $profil->fin > $dateObservee)) {
                return true;
            }
        }
        //pas de profil valide
        return false;
    }
}
