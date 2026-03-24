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
use App\ApiResource\Utilisateur;
use App\State\Utilisateur\UtilisateurManager;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class UtilisateurBeneficiaireEvenementConstraintValidator extends ConstraintValidator
{
    use UtilisateurBeneficiaireValidatorTrait;

    public function __construct(
        private readonly UtilisateurManager $utilisateurManager,
    ) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof UtilisateurBeneficiaireEvenementConstraint) {
            throw new UnexpectedTypeException($constraint, UtilisateurBeneficiaireEvenementConstraint::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Evenement) {
            throw new UnexpectedValueException($value, Evenement::class);
        }

        //pour chaque beneficiaire, est-ce qu'on a un profil valide pour la date de l'événement?
        $dateObservee = $value->debut;

        foreach ($value->beneficiaires ?? [] as $utilisateur) {
            $utilisateur = new Utilisateur($this->utilisateurManager->parUid($utilisateur->uid));
            if (!$this->utilisateurValide($utilisateur, $dateObservee)) {
                $this->context
                    ->buildViolation($constraint->message)
                    ->setParameter('{{ string }}', $utilisateur->uid)
                    ->addViolation();
            }
        }
    }
}
