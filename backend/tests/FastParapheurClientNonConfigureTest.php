<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests;

use App\Service\Signature\FastParapheurClientNonConfigure;
use LogicException;
use PHPUnit\Framework\TestCase;

class FastParapheurClientNonConfigureTest extends TestCase
{
    public function testSeDeclareIndisponible(): void
    {
        self::assertFalse((new FastParapheurClientNonConfigure())->estDisponible());
    }

    public function testRefuseLeDepot(): void
    {
        $this->expectException(LogicException::class);

        (new FastParapheurClientNonConfigure())->deposer('%PDF', 'circuit', 'libellé');
    }

    public function testRefuseLaConsultation(): void
    {
        $this->expectException(LogicException::class);

        (new FastParapheurClientNonConfigure())->consulterHistorique('document');
    }

    public function testRefuseLeTelechargement(): void
    {
        $this->expectException(LogicException::class);

        (new FastParapheurClientNonConfigure())->telecharger('document');
    }
}
