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
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class BeneficiaireDifferentGestionnaireContraintValidator extends ConstraintValidator
{
    public function __construct(
        private readonly RequestStack $request,
    ) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof BeneficiaireDifferentGestionnaireContraint) {
            throw new UnexpectedTypeException($constraint, BeneficiaireDifferentGestionnaireContraint::class);
        }

        if (!$value instanceof BeneficiaireProfil) {
            throw new UnexpectedValueException($value, BeneficiaireProfil::class);
        }

        if (!isset($value->uid)) {
            $value->uid = $this
                ->request->getCurrentRequest()
                ->attributes->get('uid');
        }

        if ($value->uid === $value->gestionnaire->uid) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
