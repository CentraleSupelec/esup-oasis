<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Tests;

class PeriodesRhTest extends ApiTestCaseCustom
{
    public function testNonPlanificateurCannotListPeriodes(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/periodes');

        $this->assertResponseStatusCodeSame(403);
    }

    public function testAdminCanListPeriodes(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/periodes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/periodes',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testAdminCanCreatePeriode(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/periodes', [
            'json' => [
                'debut' => '2012-01-01',
                'butoir' => '2012-01-29',
                'fin' => '2012-01-31',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@type' => 'PeriodeRH',
            'debut' => '2012-01-01T00:00:00+00:00',
        ]);
    }

    public function testCannotHaveButoirAfterFin(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/periodes', [
            'json' => [
                'debut' => '2021-01-01',
                'butoir' => '2021-02-01',
                'fin' => '2021-01-31',
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testCannotHaveTwoOverlappingPeriodes(): void
    {
        // Supposant qu'une période existe déjà autour de ces dates dans les fixtures
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/periodes', [
            'json' => [
                'debut' => '2022-12-15',
                'butoir' => '2023-01-10',
                'fin' => '2023-01-15',
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }
}
