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

namespace App\Tests;

class BilanFinancierTest extends ApiTestCaseCustom
{
    public function testGestionnaireCanGetBilanFinancierCsv(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/suivis/financiers/debut/2020-01-01/fin/2030-12-31', [
            'headers' => ['Accept' => 'text/csv'],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'text/csv; charset=utf-8');
    }

    public function testNonGestionnaireCannotGetBilanFinancier(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/suivis/financiers/debut/2020-01-01/fin/2030-12-31', [
            'headers' => ['Accept' => 'text/csv'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
