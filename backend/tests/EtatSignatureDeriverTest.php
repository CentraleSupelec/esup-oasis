<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Tests;

use App\Entity\DecisionAmenagementExamens;
use App\Service\Signature\Fast\EtatSignatureDeriver;
use DateTimeImmutable;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class EtatSignatureDeriverTest extends TestCase
{
    /**
     * @return array<string, array{string[], string}>
     */
    public static function historiquesProvider(): array
    {
        return [
            'historique vide' => [
                [],
                DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE,
            ],
            'envoyé pour signature' => [
                ['Envoyé pour signature'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE,
            ],
            'signé partiellement' => [
                ['Envoyé pour signature', 'Signé'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE,
            ],
            'libellé inconnu ignoré' => [
                ['Envoyé pour signature', 'Nouveau libellé v3.9'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE,
            ],

            'classé' => [
                ['Envoyé pour signature', 'Signé', 'Signé', 'Classé'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE,
            ],
            'archivé' => [
                ['Envoyé pour signature', 'Signé', 'Archivé'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE,
            ],
            'classé malgré un échec technique antérieur' => [
                ["Échec de l'envoi à FAST", 'Envoyé pour signature', 'Signé', 'Classé'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE,
            ],

            'refusé avec suffixe d\'étape' => [
                ['Envoyé pour signature', "Refusé à l'étape OTP"],
                DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE,
            ],
            'signature rejetée' => [
                ['Envoyé pour signature', 'signature rejetée'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE,
            ],
            'visa désapprouvé' => [
                ['Envoyé pour visa', 'Visa désapprouvé'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE,
            ],
            'refus puis classement d\'interruption' => [
                ['Envoyé pour signature', 'Refusé', 'Classé (interrompu)'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE,
            ],

            'circuit interrompu' => [
                ['Envoyé pour signature', 'Classé (interrompu)'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_EXPIREE,
            ],
            'document remplacé après relance' => [
                ['Envoyé pour signature', 'Document remplacé'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_REMPLACEE,
            ],

            'échec de l\'envoi' => [
                ["Échec de l'envoi à FAST"],
                DecisionAmenagementExamens::ETAT_SIGNATURE_ERREUR,
            ],
            'échec du traitement' => [
                ['Envoyé pour signature', 'Échec du traitement FAST'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_ERREUR,
            ],

            'casse et accents fantaisistes' => [
                ['ENVOYÉ POUR SIGNATURE', 'CLASSE'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE,
            ],
            'refus sans accent' => [
                ['Refuse a l\'etape 2'],
                DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE,
            ],
        ];
    }

    /**
     * @param string[] $libelles
     */
    #[DataProvider('historiquesProvider')]
    public function testDeriveEtatFromHistorique(array $libelles, string $etatAttendu): void
    {
        $deriver = new EtatSignatureDeriver();

        $this->assertSame($etatAttendu, $deriver->deriver($libelles));
    }

    public function testDateSignatureIsLastSignature(): void
    {
        $date = new EtatSignatureDeriver()->dateDeSignature([
            ['stateName' => 'Envoyé pour signature', 'date' => '2026-09-01T09:00:00+02:00'],
            ['stateName' => 'Signé', 'date' => '2026-09-02T10:00:00+02:00'],
            ['stateName' => 'Visa approuvé', 'date' => '2026-09-03T11:00:00+02:00'],
            ['stateName' => 'Signé', 'date' => '2026-09-04T16:30:00+02:00'],
            ['stateName' => 'Classé', 'date' => '2026-09-04T16:31:00+02:00'],
        ]);

        $this->assertEquals(new DateTimeImmutable('2026-09-04T16:30:00+02:00'), $date);
    }

    public function testDateSignatureFallsBackToClassement(): void
    {
        $date = new EtatSignatureDeriver()->dateDeSignature([
            ['stateName' => 'Envoyé pour signature', 'date' => '2026-09-01T09:00:00+02:00'],
            ['stateName' => 'Visa approuvé', 'date' => '2026-09-02T10:00:00+02:00'],
            ['stateName' => 'CLASSE', 'date' => '2026-09-02T10:01:00+02:00'],
        ]);

        $this->assertEquals(new DateTimeImmutable('2026-09-02T10:01:00+02:00'), $date);
    }

    public function testUnreadableDateGivesNoDateSignature(): void
    {
        $deriver = new EtatSignatureDeriver();

        $this->assertNull($deriver->dateDeSignature([
            ['stateName' => 'Signé', 'date' => 'pas une date'],
        ]));
        $this->assertNull($deriver->dateDeSignature([
            ['stateName' => 'Envoyé pour signature', 'date' => '2026-09-01T09:00:00+02:00'],
        ]));
        $this->assertNull($deriver->dateDeSignature([]));
    }

    /**
     * Historique réel d'un circuit à deux visas puis cachet serveur, qui ne classe pas le document.
     *
     * @return array<int, array{stateName: string, date: string}>
     */
    private static function circuitSansClassement(): array
    {
        return [
            ['stateName' => 'Préparé', 'date' => '2026-10-01T08:58:54+02:00'],
            ['stateName' => 'Envoyé pour visa', 'date' => '2026-10-01T08:58:54+02:00'],
            ['stateName' => 'Visa approuvé', 'date' => '2026-10-01T08:59:23+02:00'],
            ['stateName' => 'Envoyé pour visa', 'date' => '2026-10-01T08:59:24+02:00'],
            ['stateName' => 'Visa approuvé', 'date' => '2026-10-01T08:59:45+02:00'],
            ['stateName' => 'Envoyé pour signature', 'date' => '2026-10-01T08:59:46+02:00'],
            ['stateName' => 'Signé', 'date' => '2026-10-01T08:59:46+02:00'],
        ];
    }

    public function testCircuitWithoutClassementEndsOnLastSignature(): void
    {
        $deriver = new EtatSignatureDeriver();

        $this->assertTrue($deriver->termineParSignature(
            self::circuitSansClassement(),
            new DateTimeImmutable('2026-10-01T09:05:00+02:00'),
        ));
    }

    public function testRecentSignatureMayStillBeFollowedByAnotherStep(): void
    {
        // une signature intermédiaire est suivie, dans la seconde, de l'envoi à l'étape suivante
        $this->assertFalse(new EtatSignatureDeriver()->termineParSignature(
            self::circuitSansClassement(),
            new DateTimeImmutable('2026-10-01T09:01:00+02:00'),
        ));
    }

    public function testSignatureFollowedByAnotherStepDoesNotEndCircuit(): void
    {
        $historique = [
            ...self::circuitSansClassement(),
            ['stateName' => 'Envoyé pour signature', 'date' => '2026-10-01T08:59:47+02:00'],
        ];

        $this->assertFalse(new EtatSignatureDeriver()->termineParSignature(
            $historique,
            new DateTimeImmutable('2026-10-02T09:00:00+02:00'),
        ));
    }

    public function testCircuitEndingWithoutReadableSignatureDateIsNotEnded(): void
    {
        $deriver = new EtatSignatureDeriver();
        $maintenant = new DateTimeImmutable('2026-10-02T09:00:00+02:00');

        $this->assertFalse($deriver->termineParSignature([['stateName' => 'Signé', 'date' => 'pas une date']], $maintenant));
        $this->assertFalse($deriver->termineParSignature([], $maintenant));
        $this->assertTrue($deriver->termineParSignature(
            [['stateName' => "Signé à l'étape 2", 'date' => '2026-10-01T09:00:00+02:00']],
            $maintenant,
        ));
    }

    public function testSignatureWithEtapeSuffixIsCounted(): void
    {
        $date = new EtatSignatureDeriver()->dateDeSignature([
            ['stateName' => "Signé à l'étape 2", 'date' => '2026-09-04T16:30:00+02:00'],
            ['stateName' => 'Signature rejetée', 'date' => '2026-09-05T08:00:00+02:00'],
            ['stateName' => 'Classé', 'date' => '2026-09-05T08:01:00+02:00'],
        ]);

        $this->assertEquals(new DateTimeImmutable('2026-09-04T16:30:00+02:00'), $date);
    }
}
