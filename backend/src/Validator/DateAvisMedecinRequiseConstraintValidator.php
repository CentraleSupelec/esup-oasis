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
use Symfony\Component\Validator\Exception\UnexpectedTypeException;

class DateAvisMedecinRequiseConstraintValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof DateAvisMedecinRequiseConstraint) {
            throw new UnexpectedTypeException($constraint, DateAvisMedecinRequiseConstraint::class);
        }

        if (!$value instanceof DecisionResource) {
            return;
        }

        // L'exigence dépend des profils du bénéficiaire ; le provider l'a évaluée en
        // chargeant la décision (cf. ExigenceAvisMedical), et l'interface lit la même
        // valeur. Elle n'est pas modifiable par le client (groupe de sortie seul).
        if (!$value->dateAvisMedecinRequise) {
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
