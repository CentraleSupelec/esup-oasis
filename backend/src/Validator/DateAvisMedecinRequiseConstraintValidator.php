<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Validator;

use App\ApiResource\DecisionAmenagementExamens as DecisionResource;
use App\Entity\DecisionAmenagementExamens;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class DateAvisMedecinRequiseConstraintValidator extends ConstraintValidator
{
    /**
     * @param bool $requise l'exigence est facultative : tant qu'elle n'est pas demandée,
     *                      l'édition reste possible sans date, comme auparavant
     */
    public function __construct(
        #[Autowire('%env(default:decision.date_avis_medecin_requise:bool:PAEH_DATE_AVIS_MEDECIN_REQUISE)%')]
        private readonly bool $requise = false,
    ) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof DateAvisMedecinRequiseConstraint) {
            throw new UnexpectedTypeException($constraint, DateAvisMedecinRequiseConstraint::class);
        }

        if (!$this->requise) {
            return;
        }

        if (!$value instanceof DecisionResource) {
            return;
        }

        // Seule la demande d'édition est concernée : c'est elle qui produit le document.
        // Les autres écritures — observations, saisie de la date elle-même — restent
        // libres, y compris sur une décision ancienne dont la date n'a jamais été saisie.
        if (DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE !== $value->etat) {
            return;
        }

        if (null !== $value->dateAvisMedecin) {
            return;
        }

        $this->context->buildViolation($constraint->message)
            ->atPath('dateAvisMedecin')
            ->addViolation();
    }
}
