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

use App\ApiResource\Reponse;
use App\Repository\SportifHautNiveauRepository;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class IdentifiantSportifHautNiveauValideConstraintValidator extends ConstraintValidator
{
    public function __construct(
        private readonly SportifHautNiveauRepository $sportifHautNiveauRepository,
    ) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof IdentifiantSportifHautNiveauValideConstraint) {
            throw new UnexpectedTypeException($constraint, IdentifiantSportifHautNiveauValideConstraint::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Reponse) {
            throw new UnexpectedValueException($value, Reponse::class);
        }

        if ($value->question->tableOptions !== 'sportif_haut_niveau') { //todo: il manque des constantes là
            return;
        }

        //on vérifie si ça matche...règle à affiner quand on connaitra l'input...
        $sportif = $this->sportifHautNiveauRepository->findOneBy([
            'identifiantExterne' => trim($value->commentaire),
        ]);

        if (null === $sportif || $sportif->getAnneeNaissance() != $value->repondant->dateNaissance->format('Y')) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
