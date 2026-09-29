<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests;

use App\Entity\DecisionAmenagementExamens;
use App\Service\Signature\DocumentInconnuException;
use App\Service\Signature\Fast\ClientFast;
use App\Service\Signature\Fast\EtatSignatureDeriver;
use App\Service\Signature\Fast\FastParapheur;
use App\Service\Signature\ParapheurException;
use DateTimeImmutable;
use PHPUnit\Framework\TestCase;
use SoapClient;
use SoapFault;
use Symfony\Component\Clock\MockClock;

class FastParapheurTest extends TestCase
{
    private const string SIREN = '123456789';

    public function testDeposerUploadsDocumentAndReturnsItsId(): void
    {
        $soap = $this->createMock(SoapClient::class);
        $soap->expects(self::once())->method('__soapCall')
            ->with('upload', self::callback(function (array $arguments): bool {
                [$upload] = $arguments;
                self::assertSame(self::SIREN, $upload['subscriberId']);
                self::assertSame('circuit-ufr1', $upload['circuitId']);
                self::assertSame('Décision - Camille Aubert', $upload['label']);
                self::assertSame('camille.aubert@univ.example', $upload['email_destinataire']);
                self::assertSame('%PDF-test', $upload['dataFileVO']['dataHandler']);
                self::assertSame('decision-20260929-153000-' . substr(sha1('%PDF-test'), 0, 8) . '.pdf', $upload['dataFileVO']['filename']);

                return true;
            }))
            ->willReturn((object) ['return' => ' doc-42 ']);

        $documentId = $this->parapheur($soap)->deposer('%PDF-test', 'circuit-ufr1', 'Décision - Camille Aubert', 'camille.aubert@univ.example');

        self::assertSame('doc-42', $documentId);
    }

    public function testDeposerWithoutDocumentIdFails(): void
    {
        $soap = $this->createMock(SoapClient::class);
        $soap->method('__soapCall')->willReturn((object) ['return' => '']);

        $this->expectException(ParapheurException::class);
        $this->parapheur($soap)->deposer('%PDF-test', 'circuit-ufr1', 'Décision', 'camille.aubert@univ.example');
    }

    public function testSuivreReadsStateAndDateFromHistory(): void
    {
        $soap = $this->createMock(SoapClient::class);
        $soap->method('__soapCall')->with('history', [['documentId' => 'doc-42']])->willReturn((object) ['return' => [
            (object) ['stateName' => 'Envoyé pour signature', 'date' => '2026-09-20T10:00:00+02:00', 'userFullname' => 'X'],
            (object) ['stateName' => 'Signé', 'date' => '2026-09-22T16:30:00+02:00', 'userFullname' => 'Y'],
            (object) ['stateName' => 'Classé', 'date' => '2026-09-22T16:31:00+02:00', 'userFullname' => 'Y'],
        ]]);

        $suivi = $this->parapheur($soap)->suivre('doc-42');

        self::assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE, $suivi->etat);
        self::assertEquals(new DateTimeImmutable('2026-09-22T16:30:00+02:00'), $suivi->dateSignature);
    }

    public function testSuivreAcceptsSingleHistoryEntry(): void
    {
        // une seule entrée : SoapClient renvoie un objet, pas un tableau
        $soap = $this->createMock(SoapClient::class);
        $soap->method('__soapCall')->willReturn((object) ['return' => (object) ['stateName' => 'Envoyé pour signature', 'date' => '2026-09-20T10:00:00+02:00']]);

        $suivi = $this->parapheur($soap)->suivre('doc-42');

        self::assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE, $suivi->etat);
        self::assertNull($suivi->dateSignature);
    }

    public function testTelechargerReturnsSignedContent(): void
    {
        $soap = $this->createMock(SoapClient::class);
        $soap->method('__soapCall')->with('download', [['documentId' => 'doc-42', 'fdc' => 'false', 'acquit' => 'false']])
            ->willReturn((object) ['return' => (object) ['content' => '%PDF-signé']]);

        self::assertSame('%PDF-signé', $this->parapheur($soap)->telecharger('doc-42'));
    }

    public function testUnknownDocumentFaultBecomesDocumentInconnu(): void
    {
        $soap = $this->createMock(SoapClient::class);
        $soap->method('__soapCall')->willThrowException(new SoapFault('Server', 'Document introuvable : doc-42'));

        $this->expectException(DocumentInconnuException::class);
        $this->parapheur($soap)->suivre('doc-42');
    }

    public function testOtherFaultBecomesParapheurException(): void
    {
        $soap = $this->createMock(SoapClient::class);
        $soap->method('__soapCall')->willThrowException(new SoapFault('HTTP', 'Could not connect to host'));

        $this->expectException(ParapheurException::class);
        $this->expectExceptionMessage('FAST history');
        $this->parapheur($soap)->suivre('doc-42');
    }

    public function testMissingConfigurationFailsBeforeAnyCall(): void
    {
        $client = new ClientFast('https://parapheur.example/soap', self::SIREN, '', null, null);

        $this->expectException(ParapheurException::class);
        $this->expectExceptionMessage('FAST_CERTIFICAT');
        $client->historique('doc-42');
    }

    private function parapheur(SoapClient $soap): FastParapheur
    {
        $parapheur = new FastParapheur(
            new ClientFast('https://parapheur.example/soap', self::SIREN, '/certificat.pem', 'secret', null, $soap),
            new EtatSignatureDeriver(),
        );
        $parapheur->setClock(new MockClock(new DateTimeImmutable('2026-09-29T15:30:00+02:00')));

        return $parapheur;
    }
}
