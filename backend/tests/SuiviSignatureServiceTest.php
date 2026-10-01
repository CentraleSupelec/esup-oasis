<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests;

use App\Entity\DecisionAmenagementExamens;
use App\Entity\PieceJointeBeneficiaire;
use App\Service\Signature\ParapheurFactice;
use App\Service\Signature\SuiviSignatureService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class SuiviSignatureServiceTest extends KernelTestCase
{
    private EntityManagerInterface $em;
    private ParapheurFactice $parapheur;
    private SuiviSignatureService $suivi;

    protected function setUp(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $this->em = $container->get('doctrine')->getManager();
        $this->parapheur = $container->get(ParapheurFactice::class);
        $this->suivi = $container->get(SuiviSignatureService::class);
    }

    public function testSignedDecisionIsEditedAndDated(): void
    {
        [$decision, $documentId] = $this->decisionEnSignature();
        $this->parapheur->marquerSignee($documentId);

        $rapport = $this->suivi->traiterLot();

        self::assertSame(1, $rapport->signees);
        self::assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_SIGNEE, $decision->getEtatSignature());
        self::assertSame(DecisionAmenagementExamens::ETAT_EDITE, $decision->getEtat());
        self::assertNotNull($decision->getDateSignature());
        self::assertEqualsWithDelta(time(), $decision->getDateSignature()->getTimestamp(), 60);
    }

    public function testDecisionInProgressStaysEnSignature(): void
    {
        [$decision] = $this->decisionEnSignature();

        $rapport = $this->suivi->traiterLot();

        self::assertSame(0, $rapport->signees);
        self::assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE, $decision->getEtatSignature());
        self::assertSame(DecisionAmenagementExamens::ETAT_EN_SIGNATURE, $decision->getEtat());
        self::assertNull($decision->getDateSignature());
        self::assertNotNull($decision->getDerniereVerificationSignature());
    }

    public function testRefusedDecisionIsRefusee(): void
    {
        [$decision, $documentId] = $this->decisionEnSignature();
        $this->parapheur->marquerRefusee($documentId);

        $rapport = $this->suivi->traiterLot();

        self::assertSame(1, $rapport->refusees);
        self::assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_REFUSEE, $decision->getEtatSignature());
        self::assertSame(DecisionAmenagementExamens::ETAT_REFUSEE, $decision->getEtat());
        self::assertNull($decision->getDateSignature());
    }

    public function testRefusedDocumentIsFiledForHistory(): void
    {
        [$decision, $documentId] = $this->decisionEnSignature();
        $fichierDecision = $decision->getFichier();
        $this->parapheur->marquerRefusee($documentId);

        $this->suivi->traiterLot();

        $copies = $this->em->getRepository(PieceJointeBeneficiaire::class)->findBy(['beneficiaire' => $decision->getBeneficiaire()]);
        self::assertContains(
            "Décision d'aménagements refusée au " . date('d/m/Y'),
            array_map(fn(PieceJointeBeneficiaire $copie) => $copie->getLibelle(), $copies),
        );
        // la copie refusée n'est pas le document de la décision
        self::assertSame($fichierDecision, $decision->getFichier());
    }

    public function testRefusedDecisionWithoutRequesterIsRetried(): void
    {
        [$decision, $documentId] = $this->decisionEnSignature();
        $decision->setUidDemandeurSignature(null);
        $this->em->flush();
        $this->parapheur->marquerRefusee($documentId);

        $rapport = $this->suivi->traiterLot();

        // sans copie au dossier, la décision ne sort pas de la signature
        self::assertSame(1, $rapport->erreurs);
        self::assertSame(DecisionAmenagementExamens::ETAT_EN_SIGNATURE, $decision->getEtat());
    }

    public function testUnknownDocumentStopsFollowUp(): void
    {
        [$decision] = $this->decisionEnSignature();
        $decision->setIdDocumentParapheur(uniqid('document-inconnu-'));
        $this->em->flush();

        $rapport = $this->suivi->traiterLot();

        self::assertSame(1, $rapport->closes);
        self::assertSame(DecisionAmenagementExamens::ETAT_REFUSEE, $decision->getEtat());
        self::assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_ERREUR, $decision->getEtatSignature());
        self::assertSame(0, $this->suivi->traiterLot()->examinees);
    }

    public function testDecisionBackInValidationIsNotFollowed(): void
    {
        [$decision] = $this->decisionEnSignature();
        $decision->setEtat(DecisionAmenagementExamens::ETAT_ATTENTE_VALIDATION_CAS);
        $this->em->flush();

        self::assertSame(0, $this->suivi->traiterLot()->examinees);
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

        $documentId = $this->parapheur->deposer('%PDF-1.4 décision de test', 'circuit-test', 'Décision de test', 'beneficiaire@univ.example');
        $decision
            ->setEtat(DecisionAmenagementExamens::ETAT_EN_SIGNATURE)
            ->setEtatSignature(DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE)
            ->setIdDocumentParapheur($documentId)
            ->setCircuitParapheur('circuit-test')
            ->setUidDemandeurSignature('admin')
            ->setDateSignature(null)
            ->setDerniereVerificationSignature(null);
        $this->em->flush();

        return [$decision, $documentId];
    }
}
