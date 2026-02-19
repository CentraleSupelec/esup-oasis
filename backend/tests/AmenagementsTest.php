<?php

namespace App\Tests;

class AmenagementsTest extends ApiTestCaseCustom
{
    public function testGetTypesAmenagements(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $response = $client->request('GET', '/types_amenagements');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            '@context' => '/contexts/TypeAmenagement',
            '@type' => 'hydra:Collection',
            '@id' => '/types_amenagements',
        ]);
    }

    public function testAdminCanAddTypeAmenagement(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/types_amenagements', [
            'json' => [
                'libelle' => 'nouveau type aménagement',
                'pedagogique' => false,
                'examens' => true,
                'aideHumaine' => false,
                'categorie' => '/categories_amenagements/1',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            '@context' => '/contexts/TypeAmenagement',
            'libelle' => 'nouveau type aménagement',
            'pedagogique' => false,
            'examens' => true,
        ]);
    }

    public function testGestionnaireCannotAddTypeAmenagement(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('POST', '/types_amenagements', [
            'json' => [
                'libelle' => 'nouveau type aménagement',
                'pedagogique' => false,
                'examens' => true,
                'aideHumaine' => false,
                'categorie' => '/categories_amenagements/1',
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
