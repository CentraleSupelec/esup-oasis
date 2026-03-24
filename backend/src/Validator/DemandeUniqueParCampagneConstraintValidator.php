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

use App\ApiResource\Demande;
use App\Repository\DemandeRepository;
use Override;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class DemandeUniqueParCampagneConstraintValidator extends ConstraintValidator
{
    public function __construct(
        private readonly DemandeRepository $demandeRepository,
    ) {}

    #[Override]
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof DemandeUniqueParCampagneConstraint) {
            throw new UnexpectedTypeException($constraint, DemandeUniqueParCampagneConstraint::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Demande) {
            throw new UnexpectedValueException($value, Demande::class);
        }

        if (null !== $value->id || null === $value->typeDemande->campagneEnCours) {
            return; //modification d'une existante, RAS
        }

        $existante = $this->demandeRepository->findDemandeEnCoursPourUtilisateurEtCampagne(
            $value->demandeur->uid,
            $value->typeDemande->campagneEnCours->id,
        );

        if (null !== $existante) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
