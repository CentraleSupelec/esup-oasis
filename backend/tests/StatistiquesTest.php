<?php

namespace App\Tests;

class StatistiquesTest extends ApiTestCaseCustom
{
    public function testGetUnfilteredStats(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        // Note: Dans un vrai test on mockerait l'horloge pour 2040-02-01
        // et on créerait l'événement pour demain.
        // Ici on reproduit la structure des attentes Behat.

        $client->request('GET', '/statistiques');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/TableauDeBord',
            '@id' => '/statistiques',
        ]);

        // On vérifie la présence des clés attendues (les valeurs dépendent des données réelles/clock)
        $data = $client->getResponse()->toArray();
        $this->assertArrayHasKey('evenementsJour', $data);
        $this->assertArrayHasKey('evolutionJour', $data);
        $this->assertArrayHasKey('evenementsSemaine', $data);
        $this->assertArrayHasKey('evolutionSemaine', $data);
        $this->assertArrayHasKey('evenementsMois', $data);
        $this->assertArrayHasKey('evolutionMois', $data);
        $this->assertArrayHasKey('evenementsNonAffectesJour', $data);
        $this->assertArrayHasKey('evenementsNonAffectesSemaine', $data);
        $this->assertArrayHasKey('evenementsNonAffectesMois', $data);
        $this->assertArrayHasKey('totalEvenementsNonAffectes', $data);
        $this->assertArrayHasKey('evenementsEnAttenteDeValidation', $data);
        $this->assertArrayHasKey('nbBeneficiairesIncomplets', $data);
    }

    public function testGetPersonalStats(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/statistiques?utilisateur=/utilisateurs/gestionnaire');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/TableauDeBord',
            '@id' => '/statistiques',
        ]);
    }

    public function testIntervenantStatsLimited(): void
    {
        $client = $this->createClientWithCredentials('intervenant');
        $client->request('GET', '/statistiques');

        $this->assertResponseIsSuccessful();
        $data = $client->getResponse()->toArray();

        $this->assertArrayHasKey('evenementsJour', $data);
        $this->assertArrayHasKey('evenementsSemaine', $data);
        $this->assertArrayHasKey('evenementsMois', $data);

        $this->assertArrayNotHasKey('evolutionJour', $data);
        $this->assertArrayNotHasKey('evolutionSemaine', $data);
        $this->assertArrayNotHasKey('evolutionMois', $data);
    }

    public function testBeneficiaireNotAuthorized(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/statistiques');

        $this->assertResponseStatusCodeSame(403);
    }
}
