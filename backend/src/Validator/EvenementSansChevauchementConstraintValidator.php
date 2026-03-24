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
use App\State\Evenement\EvenementManager;
use DateTimeInterface;
use Override;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class EvenementSansChevauchementConstraintValidator extends ConstraintValidator
{
    public function __construct(
        private readonly EvenementManager $evenementManager,
    ) {}

    #[Override]
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof EvenementSansChevauchementConstraint) {
            throw new UnexpectedTypeException($constraint, EvenementSansChevauchementConstraint::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Evenement) {
            throw new UnexpectedValueException($value, Evenement::class);
        }

        /**
         * Pour tous les bénéficiaires et pour l'intervenant, on vérifie s'il n'existe pas déjà un
         * événement sur le créneau
         */
        $debutEvenement = (clone $value->debut)->modify('-' . $value->tempsPreparation . ' minutes');
        $finEvenement = (clone $value->fin)->modify('+' . $value->tempsSupplementaire . ' minutes');

        //intervenant
        if (null !== $value->intervenant) {
            $this->traiterConflits(
                $value->intervenant,
                $debutEvenement,
                $finEvenement,
                $value->id ?? null,
                $constraint,
            );
        }

        //Beneficiaires
        foreach ($value->beneficiaires ?? [] as $beneficiaire) {
            $this->traiterConflits($beneficiaire, $debutEvenement, $finEvenement, $value->id ?? null, $constraint);
        }
    }

    /**
     * @param Utilisateur                          $utilisateur
     * @param DateTimeInterface                    $debut
     * @param DateTimeInterface                    $fin
     * @param int|null                             $evenementId
     * @param EvenementSansChevauchementConstraint $constraint
     * @return void
     */
    private function traiterConflits(
        Utilisateur $utilisateur,
        DateTimeInterface $debut,
        DateTimeInterface $fin,
        ?int $evenementId,
        EvenementSansChevauchementConstraint $constraint,
    ): void {
        $conflits = array_filter(
            $this->evenementManager->occupationsUtilisateur($utilisateur, $debut, $fin),
            fn($conflit) => $conflit->getId() !== $evenementId,
        );

        if (!empty($conflits)) {
            $this->context
                ->buildViolation($constraint->message)
                ->setParameter('{{ string }}', $utilisateur->nomAffichage())
                ->addViolation();
        }
    }
}
