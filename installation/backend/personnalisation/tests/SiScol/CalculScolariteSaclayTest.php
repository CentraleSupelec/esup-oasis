<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests\Service\SiScol;

use App\Service\SiScol\CalculScolariteSaclay;
use PHPUnit\Framework\TestCase;

/**
 * Le calcul de Paris-Saclay lit les colonnes de ses requêtes Apogée (colonnesRequete) et
 * leur applique ses règles. Les règles elles-mêmes sont couvertes par NiveauResolverTest,
 * NiveauExtractorTest et RedoublementCalculatorTest ; ce test vérifie la lecture des
 * colonnes, telles qu'Apogée les renvoie.
 */
final class CalculScolariteSaclayTest extends TestCase
{
    public function testLeNiveauEstCalculeDepuisLesColonnesDeLaRequete(): void
    {
        $calcul = new CalculScolariteSaclay();

        self::assertSame('L2', $calcul->niveau($this->ligne(CYCLE: '1', ANNEE_DIPLOME: '2', COD_TPD_ETB: '86')));
        self::assertSame('M1', $calcul->niveau($this->ligne(CYCLE: '2', ANNEE_DIPLOME: '1', COD_TPD_ETB: '37')));
        self::assertSame('BUT2', $calcul->niveau($this->ligne(CYCLE: '1', ANNEE_DIPLOME: '2', COD_TPD_ETB: '16')));
        self::assertSame('ING3', $calcul->niveau($this->ligne(CYCLE: '4', ANNEE_DIPLOME: '1', COD_TPD_ETB: '34')));
    }

    public function testLesFormationsDeSanteNOntPasDeNiveau(): void
    {
        self::assertNull((new CalculScolariteSaclay())->niveau(
            $this->ligne(CYCLE: '1', ANNEE_DIPLOME: '1', COD_TPD_ETB: '86', TEM_SANTE: 'O'),
        ));
    }

    public function testSansTypeDeDiplomeLeCodeEtapePrendLeRelais(): void
    {
        $calcul = new CalculScolariteSaclay();

        self::assertSame('M1', $calcul->niveau($this->ligne(CYCLE: '2', ANNEE_DIPLOME: '1', COD_ETP: 'M1INFO')));
        self::assertNull($calcul->niveau($this->ligne(CYCLE: '1', ANNEE_DIPLOME: '1', COD_ETP: 'PASSMED')));
    }

    public function testLesColonnesDeLongueurFixeSontNettoyees(): void
    {
        // Apogée complète certaines colonnes par des espaces : ce ne sont pas des valeurs.
        self::assertSame('L1', (new CalculScolariteSaclay())->niveau(
            $this->ligne(CYCLE: ' 1 ', ANNEE_DIPLOME: '1 ', COD_TPD_ETB: '86  ', TEM_SANTE: 'N ', COD_ETP: '   '),
        ));
    }

    public function testLeRedoublementEstCalculeDepuisLeCompteurEtLeCursusAmenage(): void
    {
        $calcul = new CalculScolariteSaclay();

        self::assertTrue($calcul->redoublant($this->ligne(NBR_INS_ETP: '2')));
        self::assertFalse($calcul->redoublant($this->ligne(NBR_INS_ETP: '1')));
        // un parcours aménagé explique à lui seul plusieurs inscriptions à l'étape
        self::assertFalse($calcul->redoublant($this->ligne(NBR_INS_ETP: '3', COD_SIS_CUR_AMG: '1')));
    }

    public function testSansCompteurLeRedoublementEstInconnu(): void
    {
        $calcul = new CalculScolariteSaclay();

        self::assertNull($calcul->redoublant($this->ligne()));
        self::assertNull($calcul->redoublant([]));
    }

    public function testSansColonnesAucuneValeurNEstInventee(): void
    {
        // Données d'un SI qui ne renvoie pas les colonnes attendues.
        $calcul = new CalculScolariteSaclay();

        self::assertNull($calcul->niveau([]));
        self::assertNull($calcul->niveau(['niveau' => 'L3']));
    }

    /**
     * Données du connecteur Apogée : les colonnes de la requête, noms en majuscules.
     */
    private function ligne(?string ...$colonnes): array
    {
        return ['colonnesRequete' => $colonnes];
    }
}
