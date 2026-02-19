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

use App\ApiResource\BeneficiaireProfil;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class ProfilAvecTypologieConstraintValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof ProfilAvecTypologieConstraint) {
            throw new UnexpectedTypeException($value, ProfilAvecTypologieConstraint::class);
        }

        if (!$value instanceof BeneficiaireProfil) {
            throw new UnexpectedValueException($value, BeneficiaireProfil::class);
        }

        if (empty($value->typologies)) {
            if ($value->profil?->avecTypologie) {
                $this->context->buildViolation($constraint->messageObligatoire)->addViolation();
            }
            return;
        }

        if ($value->profil->avecTypologie) {
            return;
        }

        //on a des typo et on ne devrait pas !
        $this->context->buildViolation($constraint->message)->addViolation();
    }
}
