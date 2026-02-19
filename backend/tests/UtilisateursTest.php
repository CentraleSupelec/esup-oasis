<?php

namespace App\Tests;

class UtilisateursTest extends ApiTestCaseCustom
{
    public function testRenfortCanListPlanificateurs(): void
    {
        $client = $this->createClientWithCredentials('renfort');
        $client->request('GET', '/roles/ROLE_PLANIFICATEUR/utilisateurs');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/Utilisateur',
            '@type' => 'hydra:Collection',
            '@id' => '/roles/ROLE_PLANIFICATEUR/utilisateurs',
        ]);
    }

    public function testAdminCanListAdmins(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/roles/ROLE_ADMIN/utilisateurs');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/Utilisateur',
            '@type' => 'hydra:Collection',
            '@id' => '/roles/ROLE_ADMIN/utilisateurs',
        ]);
    }

    public function testGestionnaireCannotListAdmins(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/roles/ROLE_ADMIN/utilisateurs');

        $this->assertResponseStatusCodeSame(403);
    }

    public function testAdminCanListBeneficiaires(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/beneficiaires');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'hydra:totalItems' => 3,
        ]);
    }

    public function testAdminCanAddIntervenant(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('PATCH', '/utilisateurs/nouvelintervenant', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'roles' => ['ROLE_INTERVENANT'],
                'typesEvenements' => ['/types_evenements/1'],
                'campus' => ['/campus/1'],
                'competences' => ['/competences/1'],
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/utilisateurs/nouvelintervenant',
            'roles' => ['ROLE_USER', 'ROLE_INTERVENANT'],
        ]);
    }

    public function testUserCanUpdateOwnProfile(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('PATCH', '/utilisateurs/beneficiaire', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'emailPerso' => 'titi@tutu.com',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/utilisateurs/beneficiaire',
            'emailPerso' => 'titi@tutu.com',
        ]);
    }

    public function testUserCannotUpdateOtherProfile(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('PATCH', '/utilisateurs/beneficiaire2', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'emailPerso' => 'titi@tutu.com',
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }
}
