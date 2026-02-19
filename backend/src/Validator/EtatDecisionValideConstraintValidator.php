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

use App\Entity\DecisionAmenagementExamens;
use Override;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class EtatDecisionValideConstraintValidator extends ConstraintValidator
{
    #[Override]
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof EtatDecisionValideConstraint) {
            throw new UnexpectedTypeException($constraint, EtatDecisionValideConstraint::class);
        }

        //les CAS peuvent passer à VALIDE, les admins à EDITION DEMANDEE

        if (!in_array($value, [
            DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE,
            DecisionAmenagementExamens::ETAT_VALIDE,
        ])) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
