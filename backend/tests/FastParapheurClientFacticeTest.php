<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Tests;

use App\Entity\DecisionAmenagementExamens;
use App\Service\Signature\DocumentFastInconnuException;
use App\Service\Signature\EtatSignatureDeriver;
use App\Service\Signature\FastParapheurClientFactice;
use PHPUnit\Framework\TestCase;

class FastParapheurClientFacticeTest extends TestCase
{
    public function testUnDocumentDeposeEstEnSignaturePuisSigne(): void
    {
        $client = new FastParapheurClientFactice();
        $deriver = new EtatSignatureDeriver();

        $documentId = $client->deposer('%PDF-factice', 'circuit-pharmacie', 'Décision - Camille Aubert');

        $this->assertSame(
            DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE,
            $deriver->deriver(array_column($client->consulterHistorique($documentId), 'stateName')),
            'Un document tout juste déposé circule encore.',
        );

        $client->marquerCircuitTermine($documentId);

        $this->assertSame(
            DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE,
            $deriver->deriver(array_column($client->consulterHistorique($documentId), 'stateName')),
        );
        $this->assertSame('%PDF-factice', $client->telecharger($documentId));
    }

    public function testUnCircuitATroisEtapesResteEnSignatureJusquAuClassement(): void
    {
        $client = new FastParapheurClientFactice();
        $deriver = new EtatSignatureDeriver();

        $documentId = $client->deposer('%PDF-factice', 'circuit-trois-etapes', 'Décision - Inès Ravel');
        $client->marquerEtapeSignee($documentId);
        $client->marquerEtapeSignee($documentId);

        $this->assertSame(
            DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE,
            $deriver->deriver(array_column($client->consulterHistorique($documentId), 'stateName')),
        );

        $client->marquerCircuitTermine($documentId);

        $this->assertSame(
            DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE,
            $deriver->deriver(array_column($client->consulterHistorique($documentId), 'stateName')),
        );
    }

    public function testUnDocumentRefuseEstDetecteCommeTel(): void
    {
        $client = new FastParapheurClientFactice();
        $deriver = new EtatSignatureDeriver();

        $documentId = $client->deposer('%PDF-factice', 'circuit-medecine', 'Décision - Théo Marchand');
        $client->marquerRefuse($documentId);

        $this->assertSame(
            DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE,
            $deriver->deriver(array_column($client->consulterHistorique($documentId), 'stateName')),
        );
    }

    public function testDeuxDepotsNePartagentPasLeurIdentifiant(): void
    {
        $client = new FastParapheurClientFactice();

        $premier = $client->deposer('%PDF-un', 'circuit-pharmacie', 'Décision - un');
        $second = $client->deposer('%PDF-deux', 'circuit-pharmacie', 'Décision - deux');

        $this->assertNotSame($premier, $second);
        $this->assertSame('%PDF-un', $client->telecharger($premier));
        $this->assertSame('%PDF-deux', $client->telecharger($second));
    }

    public function testUnIdentifiantInconnuEstSignale(): void
    {
        $client = new FastParapheurClientFactice();

        $this->expectException(DocumentFastInconnuException::class);
        $client->consulterHistorique('document-jamais-depose');
    }

    public function testLHistoriqueRemonteUnLibelleEtUneDate(): void
    {
        $client = new FastParapheurClientFactice();
        $documentId = $client->deposer('%PDF-factice', 'circuit-pharmacie', 'Décision');

        $entree = $client->consulterHistorique($documentId)[0];

        $this->assertArrayHasKey('stateName', $entree);
        $this->assertArrayHasKey('date', $entree);
        $this->assertNotSame('', $entree['stateName']);
    }
}
