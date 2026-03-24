<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/Handicap-U-Bordeaux/esup-oasis-backend).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Tests;

use Symfony\Component\HttpFoundation\Response;

class ProfilsTest extends ApiTestCaseCustom
{
    public function testGetProfils(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/profils');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/ProfilBeneficiaire',
            '@type' => 'hydra:Collection',
            '@id' => '/profils',
        ]);
    }

    public function testAdminCanCreateProfil(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/profils', [
            'json' => [
                'libelle' => 'Nouveau Profil',
                'actif' => true,
                'avecTypologie' => true,
            ],
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $this->assertJsonContains([
            'libelle' => 'Nouveau Profil',
            'avecTypologie' => true,
        ]);
    }

    public function testGestionnaireCannotCreateProfil(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('POST', '/profils', [
            'json' => [
                'libelle' => 'Profil Interdit',
            ],
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testAdminCanPatchProfil(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('PATCH', '/profils/1', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'libelle' => 'Profil Modifié',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'libelle' => 'Profil Modifié',
        ]);
    }
}
