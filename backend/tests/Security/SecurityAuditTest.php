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

namespace App\Tests\Security;

use App\Tests\ApiTestCaseCustom;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class SecurityAuditTest extends ApiTestCaseCustom
{
    /**
     * Vérifie que le LDAP résiste aux injections (ne crash pas et ne retourne rien d'inattendu)
     */
    public function testLdapInjectionResistance(): void
    {
        $client = $this->createClientWithCredentials('admin');

        // Tentative d'injection pour bypasser le filtre (ex: fermer le filtre uid et en ouvrir un autre)
        $client->request('GET', '/utilisateurs?term=*)(uid=*');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['hydra:totalItems' => 0]);

        // Autre tentative
        $client->request('GET', '/utilisateurs?term=nom(prenom');
        $this->assertResponseIsSuccessful();
    }

    /**
     * Vérifie qu'un bénéficiaire ne peut pas créer d'aménagement pour lui-même ou autrui
     */
    public function testBeneficiaireCannotCreateAmenagement(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');
        $client->request('POST', '/utilisateurs/beneficiaire/amenagements', [
            'json' => [
                'typeAmenagement' => '/types_amenagements/1',
                'semestre1' => true,
                'semestre2' => true,
                'debut' => '2025-09-01',
                'fin' => '2026-06-30',
            ],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    /**
     * Vérifie que seul l'admin peut modifier le référentiel (Chartes, Tags, Paramètres)
     */
    public function testUnauthorizedReferentielModification(): void
    {
        $client = $this->createClientWithCredentials('beneficiaire');

        // Chartes
        $client->request('POST', '/chartes', [
            'json' => ['libelle' => 'Test', 'contenu' => 'Test'],
        ]);
        $this->assertResponseStatusCodeSame(403);

        // Tags
        $client->request('POST', '/tags', [
            'json' => ['libelle' => 'Test', 'categorie' => '/categories_tags/1'],
        ]);
        $this->assertResponseStatusCodeSame(403);

        // Valeurs Paramètres
        $client->request('POST', '/parametres/QUELCONQUE/valeurs', [
            'json' => ['valeur' => 'Test', 'debut' => '2025-01-01'],
        ]);
        $this->assertResponseStatusCodeSame(403);
    }

    /**
     * Vérifie la validation des types de fichiers (MIME vs Extension)
     */
    public function testFileUploadSecurity(): void
    {
        $client = $this->createClientWithCredentials('demandeur2');

        // 1. Incohérence MIME/Extension (JPEG déguisé en PDF)
        $tempFile = tempnam(sys_get_temp_dir(), 'test_sec');
        file_put_contents($tempFile, "\xFF\xD8\xFF\xE0" . str_repeat('A', 100)); // Header JPEG
        $uploadedFile = new UploadedFile($tempFile, 'malicieux.pdf', 'image/jpeg', null, true);

        $client->request('POST', '/telechargements', [
            'headers' => ['Content-Type' => 'multipart/form-data'],
            'extra' => [
                'files' => ['file' => $uploadedFile],
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
        $this->assertJsonContains(['hydra:description' => 'Type de fichier IMAGE incohérent avec l\'extension pdf.']);

        // 2. Type non autorisé
        $tempFile2 = tempnam(sys_get_temp_dir(), 'test_sec2');
        file_put_contents($tempFile2, '{"toto": "titi"}');
        $uploadedFile2 = new UploadedFile($tempFile2, 'script.json', 'application/json', null, true);

        $client->request('POST', '/telechargements', [
            'headers' => ['Content-Type' => 'multipart/form-data'],
            'extra' => [
                'files' => ['file' => $uploadedFile2],
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
        $this->assertJsonContains(['hydra:description' => 'Type de fichier non autorisé : json.']);
    }
}
