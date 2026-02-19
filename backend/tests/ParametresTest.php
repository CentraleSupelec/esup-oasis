<?php

namespace App\Tests;

class ParametresTest extends ApiTestCaseCustom
{
    public function testGestionnaireRightsRequiredForParametres(): void
    {
        $client = $this->createClientWithCredentials('renfort');
        $client->request('GET', '/parametres');

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGestionnaireCanReadAllParametres(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/parametres');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/Parametre',
            '@type' => 'hydra:Collection',
            '@id' => '/parametres',
        ]);
    }

    public function testAdminCanSetValueForParametre(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/parametres/FREQUENCE_RAPPELS/valeurs', [
            'json' => [
                'valeur' => 'aaa',
                'debut' => '2023-07-17T02:00:00.000Z',
                'fin' => '2023-07-19T02:00:00.000Z',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@context' => '/contexts/ValeurParametre',
            '@type' => 'ValeurParametre',
            'valeur' => 'aaa',
        ]);
    }

    public function testAdminCanModifyValue(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('PATCH', '/parametres/FREQUENCE_RAPPELS/valeurs/1', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'valeur' => 'bbb',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/ValeurParametre',
            '@type' => 'ValeurParametre',
            '@id' => '/parametres/FREQUENCE_RAPPELS/valeurs/1',
            'valeur' => 'bbb',
        ]);
    }
}
