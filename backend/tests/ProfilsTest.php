<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

class ProfilsTest extends ApiTestCaseCustom
{
    public function testAuthRequiredForProfils(): void
    {
        $client = static::createClient();
        $client->request('GET', '/profils');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testAdminCanListProfils(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/profils');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
        $this->assertJsonContains([
            '@context' => '/contexts/ProfilBeneficiaire',
            '@type' => 'hydra:Collection',
            '@id' => '/profils',
        ]);
    }

    public function testAdminCanPatchProfil(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('PATCH', '/profils/1', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'libelle' => 'nouveau libelle',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
        $this->assertJsonContains([
            '@context' => '/contexts/ProfilBeneficiaire',
            '@type' => 'ProfilBeneficiaire',
            '@id' => '/profils/1',
            'libelle' => 'nouveau libelle',
        ]);
    }
}
