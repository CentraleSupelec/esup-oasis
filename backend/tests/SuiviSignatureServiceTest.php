<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests;

use App\Entity\DecisionAmenagementExamens;
use App\Service\Signature\FastParapheurClientFactice;
use App\Service\Signature\SuiviSignatureService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class SuiviSignatureServiceTest extends KernelTestCase
{
    private EntityManagerInterface $em;
    private FastParapheurClientFactice $fast;
    private SuiviSignatureService $suivi;

    protected function setUp(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $this->em = $container->get('doctrine')->getManager();
        $this->fast = $container->get(FastParapheurClientFactice::class);
        $this->suivi = $container->get(SuiviSignatureService::class);
    }

    public function testUneDecisionSigneeEstRecupereeEtDatee(): void
    {
        [$decision, $documentId] = $this->decisionEnSignature();
        $this->fast->marquerCircuitTermine($documentId);

        $rapport = $this->suivi->traiterLot();

        self::assertSame(1, $rapport->signees);
        self::assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE, $decision->getEtatSignature());
        self::assertSame(DecisionAmenagementExamens::ETAT_EDITE, $decision->getEtat());
        self::assertNotNull($decision->getDateSignature());
        self::assertEqualsWithDelta(time(), $decision->getDateSignature()->getTimestamp(), 60);
    }

    public function testUneDecisionEnCoursResteEnSignature(): void
    {
        [$decision, $documentId] = $this->decisionEnSignature();
        $this->fast->marquerEtapeSignee($documentId);

        $rapport = $this->suivi->traiterLot();

        self::assertSame(0, $rapport->signees);
        self::assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE, $decision->getEtatSignature());
        self::assertSame(DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE, $decision->getEtat());
        self::assertNull($decision->getDateSignature());
        self::assertNotNull($decision->getDerniereVerificationFast());
    }

    public function testUnRefusEstEnregistreSansClore(): void
    {
        [$decision, $documentId] = $this->decisionEnSignature();
        $this->fast->marquerRefuse($documentId);

        $rapport = $this->suivi->traiterLot();

        self::assertSame(1, $rapport->refusees);
        self::assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE, $decision->getEtatSignature());
        self::assertSame(DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE, $decision->getEtat());
        self::assertNull($decision->getDateSignature());
    }

    /**
     * @return array{0: DecisionAmenagementExamens, 1: string}
     */
    private function decisionEnSignature(): array
    {
        $decision = $this->em->getRepository(DecisionAmenagementExamens::class)->findOneBy([]);
        if (null === $decision) {
            self::markTestSkipped('Aucune décision dans les fixtures');
        }

        $documentId = $this->fast->deposer('%PDF-1.4 décision de test', 'circuit-test', 'Décision de test');
        $decision
            ->setEtat(DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE)
            ->setEtatSignature(DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE)
            ->setFastDocumentId($documentId)
            ->setFastCircuitId('circuit-test')
            ->setUidDemandeurSignature('admin')
            ->setDateSignature(null)
            ->setDerniereVerificationFast(null);
        $this->em->flush();

        return [$decision, $documentId];
    }
}
