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

class ChartesTest extends ApiTestCaseCustom
{
    public function testAdminCanListChartes(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/chartes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/Charte',
            '@id' => '/chartes',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testUserCanSeeTheirChartes(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('GET', '/utilisateurs/demandeur/chartes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/CharteUtilisateur',
            '@id' => '/utilisateurs/demandeur/chartes',
            '@type' => 'hydra:Collection',
            'hydra:totalItems' => 1,
        ]);
    }

    public function testUserCanValidateCharte(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $response = $client->request('GET', '/utilisateurs/demandeur/chartes');
        $data = $response->toArray();
        
        $this->assertGreaterThan(0, $data['hydra:totalItems']);
        $charteId = $data['hydra:member'][0]['@id'];
        
        $client->request('PATCH', $charteId, [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'dateValidation' => (new \DateTime())->format(\DateTimeInterface::RFC3339),
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => $charteId,
        ]);
        $this->assertNotNull($client->getResponse()->toArray()['dateValidation']);
    }
}
