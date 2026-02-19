<?php

namespace App\Tests;

use App\ApiResource\ActiviteBeneficiaire;
use App\ApiResource\ActiviteIntervenant;

class BilansTest extends ApiTestCaseCustom
{
    public function testGetExtractionIntervenants(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $response = $client->request('GET', '/suivis/intervenants');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            '@context' => '/contexts/ActiviteIntervenant',
            '@type' => 'hydra:Collection',
            '@id' => '/suivis/intervenants',
        ]);

        $data = $response->toArray();
        $this->assertArrayHasKey('hydra:member', $data);
        if (count($data['hydra:member']) > 0) {
            $member = $data['hydra:member'][0];
            $this->assertArrayHasKey('utilisateur', $member);
            $this->assertArrayHasKey('campus', $member);
            $this->assertArrayHasKey('type', $member);
            $this->assertArrayHasKey('tauxHoraire', $member);
            $this->assertArrayHasKey('nbHeures', $member);
            $this->assertArrayHasKey('nbEvenements', $member);
        }
    }

    public function testGetExtractionBeneficiaires(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $response = $client->request('GET', '/suivis/beneficiaires');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'application/ld+json; charset=utf-8');

        $this->assertJsonContains([
            '@context' => '/contexts/ActiviteBeneficiaire',
            '@type' => 'hydra:Collection',
            '@id' => '/suivis/beneficiaires',
        ]);

        $data = $response->toArray();
        $this->assertArrayHasKey('hydra:member', $data);
        if (count($data['hydra:member']) > 0) {
            $member = $data['hydra:member'][0];
            $this->assertArrayHasKey('utilisateur', $member);
            $this->assertArrayHasKey('campus', $member);
            $this->assertArrayHasKey('type', $member);
            $this->assertArrayHasKey('tauxHoraire', $member);
            $this->assertArrayHasKey('nbHeures', $member);
            $this->assertArrayHasKey('nbEvenements', $member);
        }
    }

    public function testFilterResultsByPeriodeRH(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/suivis/intervenants?periode[]=/periodes/1&periode[]=/periodes/2');

        $this->assertResponseIsSuccessful();
    }
}
