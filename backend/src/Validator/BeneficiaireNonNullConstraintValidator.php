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

use App\ApiResource\Evenement;
use App\Entity\TypeEvenement;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class BeneficiaireNonNullConstraintValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof BeneficiaireNonNullConstraint) {
            throw new UnexpectedTypeException($constraint, BeneficiaireNonNullConstraint::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Evenement) {
            throw new UnexpectedValueException($value, Evenement::class);
        }

        //si type pas "au forfait", obligatoire!
        if (
            empty($value->beneficiaires ?? [])
            && !$value->type->forfait
            && $value->type->id !== TypeEvenement::TYPE_RENFORT
        ) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
