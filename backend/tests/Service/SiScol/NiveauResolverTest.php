<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests\Service\SiScol;

use App\Service\SiScol\NiveauResolver;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class NiveauResolverTest extends TestCase
{
    private NiveauResolver $resolver;

    protected function setUp(): void
    {
        // Barèmes par défaut (SISE national) : cycle 1=Licence(bac+0), 2=Master(bac+3), 3=Doctorat(bac+5).
        $this->resolver = new NiveauResolver();
    }

    /**
     * @return array<string, array{?int, ?int, ?string, ?string}>
     */
    public static function casNominaux(): array
    {
        return [
            // libellé attendu, cycle, année dans le diplôme
            'Licence année 1 => L1' => ['L1', 1, 1],
            'Licence année 2 => L2' => ['L2', 1, 2],
            'Licence année 3 => L3' => ['L3', 1, 3],
            'Master année 1 => M1' => ['M1', 2, 1],
            'Master année 2 => M2' => ['M2', 2, 2],
            'Doctorat année 1 => D1' => ['D1', 3, 1],
            'Doctorat année 3 => D3' => ['D3', 3, 3],
        ];
    }

    #[DataProvider('casNominaux')]
    public function testCasNominauxLmd(?string $attendu, ?int $cycle, ?int $annee): void
    {
        self::assertSame($attendu, $this->resolver->resolve($cycle, $annee));
    }

    /**
     * @return array<string, array{?int, ?int}>
     */
    public static function casVides(): array
    {
        return [
            'cycle inconnu' => [null, 2],
            'année inconnue' => [2, null],
            'année nulle (0)' => [2, 0],
            'cycle hors barème' => [9, 1],
            'hors barème (bac+9)' => [3, 4], // 5 + 4 = 9, pas de libellé => vide
        ];
    }

    #[DataProvider('casVides')]
    public function testCasNonCouvertsRenvoientVide(?int $cycle, ?int $annee): void
    {
        self::assertNull($this->resolver->resolve($cycle, $annee));
    }

    public function testSurchargeParTypeDiplomePrioritaire(): void
    {
        // Cas particulier piloté en config : un type "santé" forcé à un libellé,
        // et un autre forcé à vide (null), sans toucher à l'algorithme.
        $resolver = new NiveauResolver(
            surchargeParType: ['43' => 'Pharmacie 4', '99' => null],
        );

        // La surcharge prime même si le calcul nominal donnerait autre chose.
        self::assertSame('Pharmacie 4', $resolver->resolve(2, 4, '43'));
        self::assertNull($resolver->resolve(1, 2, '99'));
        // Un type sans surcharge retombe sur le calcul nominal.
        self::assertSame('M1', $resolver->resolve(2, 1, '37'));
    }

    public function testBaremesInjectablesRestentAdaptables(): void
    {
        // On peut fournir des barèmes différents (autre établissement / autre nomenclature).
        $resolver = new NiveauResolver(
            entreeParCycle: [1 => 0, 2 => 3],
            libelleParNiveau: [1 => 'Année 1', 4 => 'Année 4'],
        );
        self::assertSame('Année 1', $resolver->resolve(1, 1));
        self::assertSame('Année 4', $resolver->resolve(2, 1));
        self::assertNull($resolver->resolve(1, 2)); // pas de libellé pour bac+2 ici
    }
}
