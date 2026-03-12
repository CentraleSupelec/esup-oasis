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

use App\Entity\Utilisateur;
use Symfony\Component\HttpFoundation\Response;

class CommissionMembresTest extends ApiTestCaseCustom
{
    public function testGetMembresCollection(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/commissions/1/membres');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/MembreCommission',
            '@id' => '/commissions/1/membres',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testGetOneMembre(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('GET', '/commissions/1/membres/membrecommission');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@type' => 'MembreCommission',
            'utilisateur' => '/utilisateurs/membrecommission',
        ]);
    }

    public function testAdminCanAddMembreToCommission(): void
    {
        $client = $this->createClientWithCredentials('admin');

        // On ajoute 'intervenant' à la commission 1
        $client->request('PUT', '/commissions/1/membres/intervenant', [
            'json' => [
                'roles' => [Utilisateur::ROLE_ATTRIBUER_PROFIL],
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'utilisateur' => '/utilisateurs/intervenant',
            'roles' => [Utilisateur::ROLE_ATTRIBUER_PROFIL],
        ]);
    }

    public function testAdminCanUpdateMembreRoles(): void
    {
        $client = $this->createClientWithCredentials('admin');

        // On récupère l'IRI réelle
        $client->request('GET', '/commissions/1/membres');
        $data = $client->getResponse()->toArray();
        $iri = $data['hydra:member'][0]['@id'];

        $client->request('PUT', $iri, [
            'json' => [
                'roles' => [Utilisateur::ROLE_VALIDER_CONFORMITE_DEMANDE],
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'roles' => [Utilisateur::ROLE_VALIDER_CONFORMITE_DEMANDE],
        ]);
    }

    public function testAdminCanDeleteMembre(): void
    {
        $client = $this->createClientWithCredentials('admin');

        // On récupère l'ID réel via la collection
        $client->request('GET', '/commissions/1/membres');
        $data = $client->getResponse()->toArray();
        $iri = $data['hydra:member'][0]['@id'];

        $client->request('DELETE', $iri);

        $this->assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
    }

    public function testNonAdminCannotManageMembres(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('PUT', '/commissions/1/membres/intervenant', [
            'json' => [
                'roles' => [Utilisateur::ROLE_ATTRIBUER_PROFIL],
            ],
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }
}
