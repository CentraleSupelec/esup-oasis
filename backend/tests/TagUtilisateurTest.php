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

class TagUtilisateurTest extends ApiTestCaseCustom
{
    public function testUserCanListOwnTags(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/utilisateurs/beneficiaire/tags');

        $this->assertResponseIsSuccessful();
    }

    public function testUserCannotListOtherUserTags(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire-decision');
        $client->request('GET', '/utilisateurs/beneficiaire/tags');

        $this->assertResponseStatusCodeSame(403);
    }

    public function testPlanificateurCanListOtherUserTags(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/utilisateurs/beneficiaire/tags');

        $this->assertResponseIsSuccessful();
    }

    public function testUserCanGetOwnTag(): void
    {
        // 1. Add tag to user
        $clientAdmin = $this->createClientWithCredentials('admin');
        $clientAdmin->request('POST', '/utilisateurs/beneficiaire/tags', [
            'json' => [
                'tag' => '/tags/1',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // 2. Get tag as self
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/utilisateurs/beneficiaire/tags/1');
        $this->assertResponseIsSuccessful();
    }

    public function testUserCannotGetOtherUserTag(): void
    {
        // 1. Add tag to user
        $clientAdmin = $this->createClientWithCredentials('admin');
        $clientAdmin->request('POST', '/utilisateurs/beneficiaire/tags', [
            'json' => [
                'tag' => '/tags/1',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // 2. Get tag as another user
        $client = $this->createClientWithCredentials('beneficiaire-decision');
        $client->request('GET', '/utilisateurs/beneficiaire/tags/1');
        $this->assertResponseStatusCodeSame(403);
    }

    public function testPlanificateurCanGetOtherUserTag(): void
    {
        // 1. Add tag to user
        $clientAdmin = $this->createClientWithCredentials('admin');
        $clientAdmin->request('POST', '/utilisateurs/beneficiaire/tags', [
            'json' => [
                'tag' => '/tags/1',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);

        // 2. Get tag as planificateur
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/utilisateurs/beneficiaire/tags/1');
        $this->assertResponseIsSuccessful();
    }

    public function testPlanificateurCanAddTag(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('POST', '/utilisateurs/beneficiaire/tags', [
            'json' => [
                'tag' => '/tags/1',
            ],
        ]);
        $this->assertResponseStatusCodeSame(201);
    }

    public function testUserCannotAddTag(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('POST', '/utilisateurs/beneficiaire/tags', [
            'json' => [
                'tag' => '/tags/1',
            ],
        ]);
        $this->assertResponseStatusCodeSame(403);
    }

    public function testPlanificateurCanDeleteTag(): void
    {
        // 1. Add tag
        $clientAdmin = $this->createClientWithCredentials('admin');
        $clientAdmin->request('POST', '/utilisateurs/beneficiaire/tags', [
            'json' => [
                'tag' => '/tags/1',
            ],
        ]);

        // 2. Delete tag
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('DELETE', '/utilisateurs/beneficiaire/tags/1');
        $this->assertResponseStatusCodeSame(204);
    }

    public function testUserCannotDeleteTag(): void
    {
        // 1. Add tag
        $clientAdmin = $this->createClientWithCredentials('admin');
        $clientAdmin->request('POST', '/utilisateurs/beneficiaire/tags', [
            'json' => [
                'tag' => '/tags/1',
            ],
        ]);

        // 2. Try delete tag as user
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('DELETE', '/utilisateurs/beneficiaire/tags/1');
        $this->assertResponseStatusCodeSame(403);
    }
}
