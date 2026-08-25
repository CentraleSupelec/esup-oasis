<?php

declare(strict_types=1);

namespace App\Tests\Entity;

use App\Entity\Inscription;
use PHPUnit\Framework\TestCase;

final class InscriptionTest extends TestCase
{
    public function testGetNiveauDerivesLmdFromCycleAndYear(): void
    {
        self::assertSame('L1', (new Inscription())->setCycle(1)->setAnneeDansDiplome(1)->getNiveau());
        self::assertSame('L2', (new Inscription())->setCycle(1)->setAnneeDansDiplome(2)->getNiveau());
        self::assertSame('L3', (new Inscription())->setCycle(1)->setAnneeDansDiplome(3)->getNiveau());
        self::assertSame('M1', (new Inscription())->setCycle(2)->setAnneeDansDiplome(1)->getNiveau());
        self::assertSame('M2', (new Inscription())->setCycle(2)->setAnneeDansDiplome(2)->getNiveau());
    }

    public function testGetNiveauFallsBackToCodeEtapePrefix(): void
    {
        self::assertSame('M1', (new Inscription())->setCodeEtape('M1INFO')->getNiveau());
    }

    public function testGetNiveauIsNullWhenNotApplicable(): void
    {
        self::assertNull((new Inscription())->getNiveau());
        self::assertNull((new Inscription())->setCodeEtape('PASSMED')->getNiveau());
    }
}
