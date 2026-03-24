<?php

namespace App\Tests;

class InterventionsTest extends ApiTestCaseCustom
{
    public function testIntervenantCanListOwnServicesFaits(): void
    {
        $client = $this->createClientWithCredentials('intervenant2');
        $client->request('GET', '/intervenants/intervenant2/services_faits');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/ServicesFaits',
            '@id' => '/intervenants/intervenant2/services_faits',
            '@type' => 'hydra:Collection',
        ]);
        $this->assertJsonContains(['hydra:totalItems' => 1]);
    }

    public function testIntervenantCannotListOthersServicesFaits(): void
    {
        $client = $this->createClientWithCredentials('intervenant');
        $client->request('GET', '/intervenants/intervenant2/services_faits');

        $this->assertResponseStatusCodeSame(403);
    }

    public function testBeneficiaireCannotSeeInterventionsForfait(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/interventions_forfait');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['hydra:totalItems' => 0]);
    }

    public function testIntervenantCanSeeOwnInterventionsForfait(): void
    {
        $client = $this->createClientWithCredentials('intervenant');
        $client->request('GET', '/interventions_forfait');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['hydra:totalItems' => 1]);
    }

    public function testPlanificateurCanAddInterventionForfait(): void
    {
        $client = $this->createClientWithCredentials('renfort');
        $client->request('POST', '/interventions_forfait', [
            'json' => [
                'intervenant' => '/utilisateurs/intervenant',
                'type' => '/types_evenements/7',
                'periode' => '/periodes/3',
                'heures' => '3.5',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'utilisateurCreation' => '/utilisateurs/renfort',
        ]);
    }

    public function testPlanificateurCanFilterInterventionsByIntervenant(): void
    {
        $client = $this->createClientWithCredentials('renfort');
        $client->request('GET', '/interventions_forfait?intervenant=/utilisateurs/intervenant');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/InterventionForfait',
        ]);
    }

    public function testPlanificateurCanAddInterventionWithBeneficiaires(): void
    {
        $client = $this->createClientWithCredentials('renfort');
        $client->request('POST', '/interventions_forfait', [
            'json' => [
                'intervenant' => '/utilisateurs/intervenant',
                'type' => '/types_evenements/7',
                'periode' => '/periodes/3',
                'heures' => '8.25',
                'beneficiaires' => ['/utilisateurs/beneficiaire'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'utilisateurCreation' => '/utilisateurs/renfort',
        ]);
    }

    public function testPlanificateurCanModifyBeneficiairesEvenOnLockedPeriod(): void
    {
        $client = $this->createClientWithCredentials('renfort');
        $client->request('PATCH', '/interventions_forfait/1', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'beneficiaires' => ['/utilisateurs/beneficiaire', '/utilisateurs/beneficiaire2'],
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/interventions_forfait/1',
        ]);
    }
}
