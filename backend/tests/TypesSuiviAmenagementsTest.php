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

use Symfony\Component\HttpFoundation\Response;

class TypesSuiviAmenagementsTest extends ApiTestCaseCustom
{
    public function testGetCollection(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/types_suivi_amenagements');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/TypeSuiviAmenagement',
            '@id' => '/types_suivi_amenagements',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testAdminCanCreateTypeSuivi(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/types_suivi_amenagements', [
            'json' => [
                'libelle' => 'Nouveau Type Suivi',
                'actif' => true,
            ],
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $this->assertJsonContains([
            'libelle' => 'Nouveau Type Suivi',
            'actif' => true,
        ]);
    }

    public function testGestionnaireCannotCreateTypeSuivi(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('POST', '/types_suivi_amenagements', [
            'json' => [
                'libelle' => 'Tentative',
            ],
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testAdminCanPatchTypeSuivi(): void
    {
        $client = $this->createClientWithCredentials('admin');
        
        // On crée d'abord
        $client->request('POST', '/types_suivi_amenagements', [
            'json' => [
                'libelle' => 'A modifier',
            ],
        ]);
        $data = $client->getResponse()->toArray();
        $iri = $data['@id'];

        $client->request('PATCH', $iri, [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'libelle' => 'Modifié',
                'actif' => false,
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'libelle' => 'Modifié',
            'actif' => false,
        ]);
    }

    public function testOrderFilter(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        
        // On s'assure d'avoir au moins deux éléments avec des libellés connus
        $client = $this->createClientWithCredentials('admin');
        $client->request('POST', '/types_suivi_amenagements', ['json' => ['libelle' => 'Aaaa']]);
        $client->request('POST', '/types_suivi_amenagements', ['json' => ['libelle' => 'Zzzz']]);

        $client = $this->createClientWithCredentials('gestionnaire');
        
        $client->request('GET', '/types_suivi_amenagements?order[libelle]=asc');
        $data = $client->getResponse()->toArray();
        $items = $data['hydra:member'];
        
        $this->assertGreaterThanOrEqual(2, count($items));
        // On cherche nos éléments dans la liste triée
        $libelles = array_map(fn($i) => $i['libelle'], $items);
        $indexA = array_search('Aaaa', $libelles);
        $indexZ = array_search('Zzzz', $libelles);
        
        if ($indexA !== false && $indexZ !== false) {
            $this->assertLessThan($indexZ, $indexA);
        }

        $client->request('GET', '/types_suivi_amenagements?order[libelle]=desc');
        $data = $client->getResponse()->toArray();
        $items = $data['hydra:member'];
        $libelles = array_map(fn($i) => $i['libelle'], $items);
        $indexA = array_search('Aaaa', $libelles);
        $indexZ = array_search('Zzzz', $libelles);
        
        if ($indexA !== false && $indexZ !== false) {
            $this->assertGreaterThan($indexZ, $indexA);
        }
    }
}
