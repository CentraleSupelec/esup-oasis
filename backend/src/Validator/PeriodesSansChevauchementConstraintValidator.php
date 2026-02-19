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

use App\ApiResource\PeriodeRH;
use App\State\PeriodeRH\PeriodeManager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class PeriodesSansChevauchementConstraintValidator extends ConstraintValidator
{
    public function __construct(
        private readonly PeriodeManager $periodeManager,
    ) {}

    /**
     * @inheritDoc
     */
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof PeriodesSansChevauchementConstraint) {
            throw new UnexpectedTypeException($value, PeriodesSansChevauchementConstraint::class);
        }

        if (!$value instanceof PeriodeRH) {
            throw new UnexpectedValueException($value, PeriodeRH::class);
        }

        //on regarde s'il y a chevauchement
        foreach ($this->periodeManager->periodesDansIntervalle($value->debut, $value->fin) as $chevauchement) {
            if ($chevauchement->getId() === $value->id) {
                continue;
            }
            $this->context
                ->buildViolation(message: $constraint->message)
                ->setParameter('{{ debut }}', $chevauchement->getDebut()->format('d/m/Y'))
                ->setParameter('{{ fin }}', $chevauchement->getFin()->format('d/m/Y'))
                ->addViolation();
        }
    }
}
