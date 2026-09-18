<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Tests\Validator;

use App\ApiResource\DecisionAmenagementExamens as DecisionResource;
use App\Entity\DecisionAmenagementExamens;
use App\Validator\DateAvisMedecinRequiseConstraint;
use App\Validator\DateAvisMedecinRequiseConstraintValidator;
use DateTime;
use Symfony\Component\Validator\Test\ConstraintValidatorTestCase;

/**
 * L'exigence de la date de l'avis du médecin est facultative : tant qu'elle n'est pas
 * demandée, l'édition reste possible sans date, exactement comme auparavant.
 */
class DateAvisMedecinRequiseConstraintValidatorTest extends ConstraintValidatorTestCase
{
    private bool $requise = false;

    protected function createValidator(): DateAvisMedecinRequiseConstraintValidator
    {
        return new DateAvisMedecinRequiseConstraintValidator($this->requise);
    }

    public function testSansExigenceLEditionEstPossibleSansDate(): void
    {
        // Comportement d'un établissement qui n'active rien : inchangé.
        $this->validator->validate(
            $this->decision(etat: DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE),
            new DateAvisMedecinRequiseConstraint(),
        );

        $this->assertNoViolation();
    }

    public function testAvecExigenceLEditionSansDateEstRefusee(): void
    {
        $this->activerExigence();
        $contrainte = new DateAvisMedecinRequiseConstraint();

        $this->validator->validate(
            $this->decision(etat: DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE),
            $contrainte,
        );

        $this->buildViolation($contrainte->message)->atPath('property.path.dateAvisMedecin')->assertRaised();
    }

    public function testAvecExigenceLaDateSaisieLaisseEditer(): void
    {
        $this->activerExigence();

        $this->validator->validate(
            $this->decision(etat: DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE, date: new DateTime('2026-09-01')),
            new DateAvisMedecinRequiseConstraint(),
        );

        $this->assertNoViolation();
    }

    public function testSeuleLaDemandeDEditionEstConcernee(): void
    {
        // Saisir des observations, ou la date elle-même, reste libre — y compris sur une
        // décision ancienne dont la date n'a jamais été renseignée.
        $this->activerExigence();

        $this->validator->validate(
            $this->decision(etat: DecisionAmenagementExamens::ETAT_VALIDE),
            new DateAvisMedecinRequiseConstraint(),
        );

        $this->assertNoViolation();
    }

    private function activerExigence(): void
    {
        $this->requise = true;
        $this->validator = $this->createValidator();
        $this->validator->initialize($this->context);
    }

    private function decision(string $etat, ?DateTime $date = null): DecisionResource
    {
        $decision = new DecisionResource();
        $decision->etat = $etat;
        $decision->dateAvisMedecin = $date;

        return $decision;
    }
}
