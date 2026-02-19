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

use App\ApiResource\Amenagement;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class AmenagementDatesConstraintValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof AmenagementDatesConstraint) {
            throw new UnexpectedTypeException($constraint, AmenagementDatesConstraint::class);
        }

        if (!$value instanceof Amenagement) {
            throw new UnexpectedValueException($value, Amenagement::class);
        }

        if (null == $value->debut && !$value->semestre1 && !$value->semestre2) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
