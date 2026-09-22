<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests\Entity;

use App\Entity\Formation;
use App\Entity\Inscription;
use PHPUnit\Framework\TestCase;

final class InscriptionTest extends TestCase
{
    public function testGetNiveauPrefersNiveauFromFormation(): void
    {
        // Un SI scolarité qui renseigne le niveau de la formation garde exactement
        // son affichage, même quand le connecteur en propose un autre.
        $inscription = (new Inscription())
            ->setFormation((new Formation())->setNiveau('  Licence 1ère année  '))
            ->setNiveau('M1');

        self::assertSame('Licence 1ère année', $inscription->getNiveau());
    }

    public function testGetNiveauFallsBackToConnectorValue(): void
    {
        // Formation sans niveau (colonne vide ou SI qui ne la renseigne pas) : on
        // reprend celui fourni par le connecteur. Une colonne de longueur fixe peut
        // arriver complétée d'espaces, ce n'est pas davantage un niveau renseigné
        // qu'une valeur vide.
        foreach ([null, '', ' ', '   '] as $niveauFormation) {
            $inscription = (new Inscription())
                ->setFormation((new Formation())->setNiveau($niveauFormation))
                ->setNiveau('M1');

            self::assertSame('M1', $inscription->getNiveau());
        }
    }

    public function testGetNiveauIsNullWithoutAnySource(): void
    {
        // Aucun connecteur ne dérive le niveau et la formation n'en porte pas :
        // comportement d'une instance qui n'a rien personnalisé.
        self::assertNull((new Inscription())->getNiveau());
        self::assertNull(
            (new Inscription())->setFormation((new Formation())->setNiveau(null))->getNiveau(),
        );
    }

    public function testRedoublantIsNullUntilConnectorDecides(): void
    {
        // Le cœur ne déduit pas le redoublement : sans connecteur pour se
        // prononcer, l'information reste inconnue plutôt que fausse.
        self::assertNull((new Inscription())->isRedoublant());
        self::assertTrue((new Inscription())->setRedoublant(true)->isRedoublant());
        self::assertFalse((new Inscription())->setRedoublant(false)->isRedoublant());
    }
}
