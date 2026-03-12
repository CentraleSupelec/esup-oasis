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

class PiecesJointesTest extends ApiTestCaseCustom
{
    public function testGestionnaireCanListPiecesJointes(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', '/beneficiaires/beneficiaire/pieces_jointes');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/contexts/PieceJointeBeneficiaire',
            '@id' => '/beneficiaires/beneficiaire/pieces_jointes',
            '@type' => 'hydra:Collection',
        ]);
    }

    public function testBeneficiaireCanSeeOwnPiecesJointes(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/beneficiaires/beneficiaire/pieces_jointes');

        $this->assertResponseIsSuccessful();
    }

    public function testBeneficiaireCannotSeeOtherPiecesJointes(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('GET', '/beneficiaires/beneficiaire2/pieces_jointes');

        $this->assertResponseStatusCodeSame(403);
    }

    public function testGestionnaireCanUploadAndDeletePieceJointe(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        
        // 1. Upload a file first
        $tempFile = tempnam(sys_get_temp_dir(), 'test_pj');
        file_put_contents($tempFile, 'contenu pj');
        $uploadedFile = new \Symfony\Component\HttpFoundation\File\UploadedFile($tempFile, 'pj.txt', 'text/plain', null, true);

        $client->request('POST', '/telechargements', [
            'headers' => ['Content-Type' => 'multipart/form-data'],
            'extra' => ['files' => ['file' => $uploadedFile]],
        ]);
        $this->assertResponseStatusCodeSame(201);
        $fileData = $client->getResponse()->toArray();
        $fileIri = $fileData['@id'];

        // 2. Create the PieceJointeBeneficiaire
        $client->request('POST', '/beneficiaires/beneficiaire/pieces_jointes', [
            'json' => [
                'libelle' => 'Ma pièce jointe test',
                'fichier' => $fileIri,
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $pjData = $client->getResponse()->toArray();
        $pjIri = $pjData['@id'];
        $this->assertEquals('Ma pièce jointe test', $pjData['libelle']);

        // 2b. GET it to exercise getters
        $client->request('GET', $pjIri);
        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'libelle' => 'Ma pièce jointe test',
        ]);

        // 3. Delete it
        $client->request('DELETE', $pjIri);
        $this->assertResponseStatusCodeSame(204);

        // 4. Verify it's gone
        $client->request('GET', $pjIri);
        $this->assertResponseStatusCodeSame(404);
    }
}
