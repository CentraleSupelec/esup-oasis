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

class DecisionsTest extends ApiTestCaseCustom
{
    public function testGestionnaireCanGetDecision(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/utilisateurs/beneficiaire-decision/decisions/2025');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/DecisionAmenagementExamens',
        ]);
    }

    public function testAdminCanPatchDecision(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $client->request('PATCH', '/utilisateurs/beneficiaire-decision/decisions/2025', [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => [
                'etat' => 'EDITION_DEMANDEE',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'etat' => 'EDITION_DEMANDEE',
        ]);
    }

    public function testBeneficiaireCannotGetDecisionWithoutRights(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire-decision');
        $client->request('GET', '/utilisateurs/beneficiaire-decision/decisions/2025');

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGestionnaireCanGetDecisionPdf(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/utilisateurs/beneficiaire-decision/decisions/2025', [
            'headers' => [
                'Accept' => 'application/pdf',
            ],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertStringContainsString('application/pdf', $client->getResponse()->getHeaders()['content-type'][0]);
    }
}
