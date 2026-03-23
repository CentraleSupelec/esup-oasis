<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Tests;

class SportifHautNiveauTest extends ApiTestCaseCustom
{
    public function testAdminCanListSportifs(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/sportifs_haut_niveau');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/SportifHautNiveau',
            '@id' => '/sportifs_haut_niveau',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testAdminCanCreateSportif(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/sportifs_haut_niveau', [
            'json' => [
                'identifiantExterne' => 'SHN123',
                'nom' => 'DOE',
                'prenom' => 'John',
                'anneeNaissance' => 2000,
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'identifiantExterne' => 'SHN123',
            'nom' => 'DOE',
            'prenom' => 'John',
        ]);
    }

    public function testAdminCanPatchSportif(): void
    {
        // On en crée un d'abord (identifiantExterne est l'identifiant API)
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/sportifs_haut_niveau', [
            'json' => [
                'identifiantExterne' => 'SHN456',
                'nom' => 'SMITH',
                'prenom' => 'Jane',
            ],
        ]);

        $client->request('PATCH', '/sportifs_haut_niveau/SHN456', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'nom' => 'SMITH-UPDATED',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'identifiantExterne' => 'SHN456',
            'nom' => 'SMITH-UPDATED',
        ]);
    }

    public function testAdminCanDeleteSportif(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/sportifs_haut_niveau', [
            'json' => [
                'identifiantExterne' => 'SHN789',
                'nom' => 'DELETE',
                'prenom' => 'Me',
            ],
        ]);

        $client->request('DELETE', '/sportifs_haut_niveau/SHN789');
        $this->assertResponseStatusCodeSame(204);
    }

    public function testNonAdminCannotListSportifs(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/sportifs_haut_niveau');

        $this->assertResponseStatusCodeSame(403);
    }
}
