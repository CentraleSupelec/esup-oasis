<?php

namespace App\Tests;

use Symfony\Component\Clock\ClockAwareTrait;

class DemandesTest extends ApiTestCaseCustom
{
    use ClockAwareTrait;

    public function testGetTypesDemandes(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('GET', '/types_demandes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/types_demandes',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testAdminCanCreateTypeDemande(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/types_demandes', [
            'json' => [
                'libelle' => 'nouveau type',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'libelle' => 'nouveau type',
        ]);
    }

    public function testGestionnaireCanSeeAllDemandes(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/demandes');
        $this->assertResponseIsSuccessful();
    }

    public function testDemandeurCanSeeOnlyOwnDemandes(): void
    {
        // Ce test suppose que les fixtures sont chargées et que 'demandeur' a des demandes
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('GET', '/demandes');

        $this->assertResponseIsSuccessful();
        // L'assertion exacte dépend des fixtures, mais on valide le principe
        $data = $client->getResponse()->toArray();
        foreach ($data['hydra:member'] as $demande) {
            $this->assertEquals('/utilisateurs/demandeur', $demande['demandeur']['@id']);
        }
    }

    public function testDemandeurCanStartNewDemande(): void
    {
        $client = $this->createClientWithCredentials('demandeur2');
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/1',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'demandeur' => ['uid' => 'demandeur2'],
        ]);
    }

    public function testGestionnaireCanStartDemandeForOther(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/1',
                'demandeur' => '/utilisateurs/demandeur3',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'demandeur' => ['uid' => 'demandeur3'],
        ]);
    }

    public function testDemandeurCannotStartDemandeForOther(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('POST', '/demandes', [
            'json' => [
                'typeDemande' => '/types_demandes/1',
                'demandeur' => '/utilisateurs/intervenant',
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGestionnaireCanUpdateDemandeEtat(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('PATCH', '/demandes/1', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'etat' => '/etats_demandes/3',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'etat' => '/etats_demandes/3',
        ]);
    }

    public function testDemandeurCanAnswerQuestion(): void
    {
        $client = $this->createClientWithCredentials('demandeur');
        $client->request('PUT', '/demandes/1/questions/3/reponse', [
            'json' => [
                'optionsChoisies' => ['/questions/3/options/3'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            '@id' => '/demandes/1/questions/3/reponse',
        ]);
    }
}
