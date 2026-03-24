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
use App\Entity\EtatDemande;
use App\State\Demande\DemandeManager;
use Override;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class DemandeWorkflowConstraintValidator extends ConstraintValidator
{
    public function __construct(
        private readonly DemandeManager $demandeManager,
    ) {}

    #[Override]
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof DemandeWorkflowConstraint) {
            throw new UnexpectedTypeException($constraint, DemandeWorkflowConstraint::class);
        }

        if (null === $value || '' === $value) {
            return;
        }

        if (!$value instanceof Demande) {
            throw new UnexpectedValueException($value, Demande::class);
        }

        //transitions autorisées
        $transitions = [
            PHP_INT_MIN => [EtatDemande::EN_COURS],
            EtatDemande::EN_COURS => [EtatDemande::EN_COURS, EtatDemande::RECEPTIONNEE, EtatDemande::REFUSEE],
            EtatDemande::RECEPTIONNEE => [EtatDemande::RECEPTIONNEE, EtatDemande::CONFORME, EtatDemande::NON_CONFORME],
            EtatDemande::CONFORME => [
                EtatDemande::CONFORME,
                EtatDemande::ATTENTE_COMMISSION,
                EtatDemande::PROFIL_VALIDE,
                EtatDemande::REFUSEE,
            ],
            EtatDemande::NON_CONFORME => [EtatDemande::RECEPTIONNEE],
            EtatDemande::ATTENTE_COMMISSION => [
                EtatDemande::ATTENTE_COMMISSION,
                EtatDemande::PROFIL_VALIDE,
                EtatDemande::REFUSEE,
            ],
            EtatDemande::REFUSEE => [EtatDemande::REFUSEE],
            EtatDemande::VALIDEE => [EtatDemande::VALIDEE],
            EtatDemande::ATTENTE_VALIDATION_CHARTE => [EtatDemande::ATTENTE_VALIDATION_CHARTE, EtatDemande::VALIDEE],
            EtatDemande::ATTENTE_VALIDATION_ACCOMPAGNEMENT => [EtatDemande::VALIDEE, EtatDemande::REFUSEE],
        ];

        $etatOrigine = match ($value->id) {
            null => PHP_INT_MIN,
            default => $this->demandeManager
                ->getDemande($value->id)
                ->getEtat()
                ->getId(),
        };

        $nouvelEtat = $value->etat?->id ?? EtatDemande::EN_COURS;

        if (!in_array($nouvelEtat, $transitions[$etatOrigine] ?? [])) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }

        //On ne peut pas passer conforme une demande incomplète
        if (in_array($nouvelEtat, [EtatDemande::CONFORME, EtatDemande::RECEPTIONNEE]) && !$value->complete) {
            $this->context
                ->buildViolation($constraint->messageDemandeIncomplete)
                ->setParameter('{{ etat }}', match ($nouvelEtat) {
                    EtatDemande::CONFORME => 'conforme',
                    default => 'réceptionnée',
                })
                ->addViolation();
        }
    }
}
