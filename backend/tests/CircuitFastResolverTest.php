<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Tests;

use App\Entity\Composante;
use App\Entity\DecisionAmenagementExamens;
use App\Entity\Formation;
use App\Entity\Inscription;
use App\Entity\Utilisateur;
use App\Service\Signature\CircuitFastResolver;
use DateTime;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;

class CircuitFastResolverTest extends TestCase
{
    private const string MAPPING = '{"UFR1": "circuit-pharma", "UFR2": "circuit-medecine"}';

    public function testSansConfigurationLaDecisionSuitLeComportementHistorique(): void
    {
        $decision = $this->decisionAvecComposantes(['UFR1']);

        $this->assertNull($this->resolver(null)->circuitPour($decision));
        $this->assertNull($this->resolver('')->circuitPour($decision));
        $this->assertNull($this->resolver('   ')->circuitPour($decision));
    }

    public function testUneConfigurationIllisibleDesactiveLeConnecteurSansCasserLEnvoi(): void
    {
        $decision = $this->decisionAvecComposantes(['UFR1']);

        $this->assertNull($this->resolver('{pas du json')->circuitPour($decision));
        $this->assertNull($this->resolver('"juste une chaine"')->circuitPour($decision));
    }

    public function testLaComposanteRelieeAUnCircuitEstDeposeeDansCeCircuit(): void
    {
        $decision = $this->decisionAvecComposantes(['UFR1']);

        $this->assertSame('circuit-pharma', $this->resolver(self::MAPPING)->circuitPour($decision));
    }

    public function testUneComposanteHorsMappingSuitLeComportementHistorique(): void
    {
        $decision = $this->decisionAvecComposantes(['UFR9']);

        $this->assertNull($this->resolver(self::MAPPING)->circuitPour($decision));
    }

    public function testPlusieursComposantesVersLeMemeCircuitNeBloquentPas(): void
    {
        $mapping = '{"UFR1": "circuit-commun", "UFR2": "circuit-commun"}';
        $decision = $this->decisionAvecComposantes(['UFR1', 'UFR2']);

        $this->assertSame('circuit-commun', $this->resolver($mapping)->circuitPour($decision));
    }

    public function testDesCircuitsDistinctsFontReplierSurLeComportementHistorique(): void
    {
        $decision = $this->decisionAvecComposantes(['UFR1', 'UFR2']);

        $this->assertNull($this->resolver(self::MAPPING)->circuitPour($decision));
    }

    public function testUneInscriptionTermineeNEstPasPriseEnCompte(): void
    {
        $decision = $this->decisionAvecComposantes(['UFR1'], enCours: false);

        $this->assertNull($this->resolver(self::MAPPING)->circuitPour($decision));
    }

    private function resolver(?string $fastCircuits): CircuitFastResolver
    {
        return new CircuitFastResolver($fastCircuits, new NullLogger());
    }

    /**
     * @param string[] $codesComposante
     */
    private function decisionAvecComposantes(array $codesComposante, bool $enCours = true): DecisionAmenagementExamens
    {
        $beneficiaire = new Utilisateur();

        foreach ($codesComposante as $code) {
            $composante = new Composante();
            $composante->setCodeExterne($code);

            $formation = new Formation();
            $formation->setComposante($composante);

            $inscription = new Inscription();
            $inscription->setFormation($formation);
            $inscription->setDebut(new DateTime($enCours ? '-1 month' : '-13 months'));
            $inscription->setFin(new DateTime($enCours ? '+1 month' : '-1 month'));

            $beneficiaire->addInscription($inscription);
        }

        return new DecisionAmenagementExamens()->setBeneficiaire($beneficiaire);
    }
}
