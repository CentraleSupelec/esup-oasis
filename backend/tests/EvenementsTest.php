<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Tests;

class EvenementsTest extends ApiTestCaseCustom
{
    public function testUnauthenticated(): void
    {
        $client = static::createClient();
        $client->request('GET', '/evenements/1');

        $this->assertResponseStatusCodeSame(401);
    }

    public function testAdminCanListEvenements(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/evenements');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/Evenement',
            '@type' => 'hydra:Collection',
            'hydra:totalItems' => 2,
        ]);
    }

    public function testGestionnaireCanPostEvent(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('POST', '/evenements', [
            'json' => [
                'debut' => '2030-06-01T08:00',
                'fin' => '2030-06-01T12:00',
                'libelle' => '',
                'type' => '/types_evenements/1',
                'campus' => '/campus/1',
                'beneficiaires' => ['/utilisateurs/beneficiaire'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'campus' => '/campus/1',
            'type' => '/types_evenements/1',
        ]);
    }

    public function testBeneficiaireCannotHaveOverlappingEvents(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('POST', '/evenements', [
            'json' => [
                'debut' => '2030-01-01T07:00',
                'fin' => '2030-01-01T09:00',
                'libelle' => 'chevauchement',
                'type' => '/types_evenements/1',
                'campus' => '/campus/1',
                'beneficiaires' => ['/utilisateurs/beneficiaire'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testAdminCanPatchEventBeneficiaires(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('PATCH', '/evenements/1', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'beneficiaires' => ['/utilisateurs/beneficiaire', '/utilisateurs/beneficiaire2'],
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@id' => '/evenements/1',
        ]);

        // On pourrait vérifier le contenu de beneficiaires si nécessaire
    }

    public function testEventCannotEndBeforeStart(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('POST', '/evenements', [
            'json' => [
                'debut' => '2021-01-01T08:00',
                'fin' => '2020-01-01T12:00',
                'libelle' => '',
                'type' => '/types_evenements/1',
                'campus' => '/campus/1',
                'beneficiaires' => ['/utilisateurs/beneficiaire'],
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testBeneficiaireCanSeeOwnEvents(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/evenements');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'hydra:totalItems' => 3,
        ]);
    }

    public function testPlanificateurCanDeleteEvent(): void
    {
        $client = $this->createClientWithCredentials('renfort');
        $client->request('DELETE', '/evenements/1');

        $this->assertResponseStatusCodeSame(204);
    }

    public function testIntervenantCanSeeOwnEvents(): void
    {
        $client = $this->createClientWithCredentials('intervenant');
        $client->request('GET', '/evenements');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'hydra:totalItems' => 2,
        ]);
    }

    public function testCannotDeleteEventSentToHR(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('DELETE', '/evenements/2');

        $this->assertResponseStatusCodeSame(403);
    }
}
