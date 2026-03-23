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

class BilanActiviteTest extends ApiTestCaseCustom
{
    public function testGestionnaireCanListBilanActivite(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/suivis/activite');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/BilanActivite',
            '@id' => '/suivis/activite',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testGestionnaireCanRequestBilanActivite(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('POST', '/suivis/activite', [
            'json' => [
                'debut' => '2024-01-01',
                'fin' => '2024-12-31',
                'gestionnaires' => ['/utilisateurs/gestionnaire'],
                'composantes' => ['/composantes/1'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'debut' => '2024-01-01T00:00:00+00:00',
            'fin' => '2024-12-31T00:00:00+00:00',
            'demandeur' => '/utilisateurs/gestionnaire',
        ]);
    }

    public function testNonGestionnaireCannotRequestBilanActivite(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('POST', '/suivis/activite', [
            'json' => [
                'debut' => '2024-01-01',
                'fin' => '2024-12-31',
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testOwnerCanDeleteBilanActivite(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $response = $client->request('POST', '/suivis/activite', [
            'json' => [
                'debut' => '2024-01-01',
                'fin' => '2024-12-31',
            ],
        ]);
        $data = $response->toArray();
        $id = $data['@id'];

        $client->request('DELETE', $id);
        $this->assertResponseStatusCodeSame(204);
    }

    public function testNonOwnerCannotDeleteBilanActivite(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $response = $client->request('POST', '/suivis/activite', [
            'json' => [
                'debut' => '2024-01-01',
                'fin' => '2024-12-31',
            ],
        ]);
        $data = $response->toArray();
        $id = $data['@id'];

        $client = $this->createClientWithCredentials('gestionnaire2');
        $client->request('DELETE', $id);
        $this->assertResponseStatusCodeSame(403);
    }
}
