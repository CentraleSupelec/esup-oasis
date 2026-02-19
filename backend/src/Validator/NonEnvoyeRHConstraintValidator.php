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
use App\ApiResource\InterventionForfait;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class NonEnvoyeRHConstraintValidator extends ConstraintValidator
{
    /**
     * @param Evenement  $value
     * @param Constraint $constraint
     * @return void
     */
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof NonEnvoyeRHConstraint) {
            throw new UnexpectedTypeException($constraint, NonEnvoyeRHConstraint::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Evenement && !$value instanceof InterventionForfait) {
            throw new UnexpectedValueException($value, Evenement::class . ' / ' . InterventionForfait::class);
        }

        if (
            $value instanceof Evenement && null !== $value->dateEnvoiRH
            || $value instanceof InterventionForfait && $value->periode->envoyee
        ) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
