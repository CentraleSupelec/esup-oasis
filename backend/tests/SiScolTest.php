<?php

namespace App\Tests;

class SiScolTest extends ApiTestCaseCustom
{
    public function testGetComposantes(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/composantes');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'application/ld+json; charset=utf-8');
        $this->assertJsonContains([
            '@context' => '/contexts/Composante',
            '@type' => 'hydra:Collection',
            '@id' => '/composantes',
        ]);
    }

    public function testGetFormations(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/formations');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'application/ld+json; charset=utf-8');
        $this->assertJsonContains([
            '@context' => '/contexts/Formation',
            '@type' => 'hydra:Collection',
            '@id' => '/formations',
        ]);
    }
}
