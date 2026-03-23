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

class ParametreUITest extends ApiTestCaseCustom
{
    public function testUserCanSetParametreUI(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        
        $client->request('PUT', '/utilisateurs/beneficiaire/parametres_ui/THEME', [
            'json' => [
                'valeur' => 'dark',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'valeur' => 'dark',
        ]);
    }

    public function testUserCanGetOwnParametresUI(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        
        // On s'assure qu'il y en a au moins un (ceux créés par les tests précédents sont persistés!)
        $client->request('PUT', '/utilisateurs/beneficiaire/parametres_ui/LANG', [
            'json' => [
                'valeur' => 'fr',
            ],
        ]);

        $client->request('GET', '/utilisateurs/beneficiaire/parametres_ui');

        $this->assertResponseIsSuccessful();
        $data = $client->getResponse()->toArray();
        $this->assertGreaterThanOrEqual(1, $data['hydra:totalItems']);
    }

    public function testUserCanGetSpecificParametreUI(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        
        $client->request('PUT', '/utilisateurs/beneficiaire/parametres_ui/FONT_SIZE', [
            'json' => [
                'valeur' => '14px',
            ],
        ]);

        $client->request('GET', '/utilisateurs/beneficiaire/parametres_ui/FONT_SIZE');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'valeur' => '14px',
        ]);
    }

    public function testUserCannotAccessOthersParametresUI(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/utilisateurs/intervenant/parametres_ui');

        $this->assertResponseStatusCodeSame(403);
    }

    public function testUserCannotModifyOthersParametresUI(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('PUT', '/utilisateurs/intervenant/parametres_ui/HACK', [
            'json' => [
                'valeur' => 'evil',
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testUserCanDeleteOwnParametreUI(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        
        $client->request('PUT', '/utilisateurs/beneficiaire/parametres_ui/TO_DELETE', [
            'json' => [
                'valeur' => 'bye',
            ],
        ]);

        $client->request('DELETE', '/utilisateurs/beneficiaire/parametres_ui/TO_DELETE');
        $this->assertResponseStatusCodeSame(204);

        $client->request('GET', '/utilisateurs/beneficiaire/parametres_ui/TO_DELETE');
        $this->assertResponseStatusCodeSame(404);
    }
}
