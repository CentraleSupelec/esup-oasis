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

use App\ApiResource\ValeurParametre;
use App\Repository\ParametreRepository;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class ValeurParametreUniqueConstraintValidator extends ConstraintValidator
{
    public function __construct(
        private readonly ParametreRepository $parametreRepository,
    ) {}

    /**
     * @param ValeurParametre                 $value
     * @param ValeurParametreUniqueConstraint $constraint
     * @return void
     */
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof ValeurParametreUniqueConstraint) {
            throw new UnexpectedTypeException($constraint, UtilisateurBeneficiaireEvenementConstraint::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof ValeurParametre) {
            throw new UnexpectedValueException($value, ValeurParametre::class);
        }

        //il existe déjà une valeur active sur l'intervalle ?
        $param = $this->parametreRepository->findOneBy(['cle' => $value->cle]);

        $erreur = array_filter($param->getValeursParametres()->toArray(), fn($valeur) => $this->chevauchement(
            $value,
            $valeur,
        ));
        if (!empty($erreur)) {
            $this->context
                ->buildViolation($constraint->message)
                ->setParameter('{{ string }}', $param->getCle())
                ->addViolation();
        }
    }

    private function chevauchement(ValeurParametre $value, \App\Entity\ValeurParametre $valeur): bool
    {
        if ($valeur->getId() === $value->id) {
            return false;
        }

        if ($valeur->getDebut() >= $value->debut && (null === $value->fin || $valeur->getDebut() <= $value->fin)) {
            return true;
        }

        if (
            $value->debut >= $valeur->getDebut()
            && (null === $valeur->getFin() || $value->debut <= $valeur->getFin())
        ) {
            return true;
        }

        return false;
    }
}
