<?php

namespace App\Tests;

use App\Entity\DecisionAmenagementExamens;
use App\Entity\Formation;
use App\Entity\Inscription;
use App\Message\DecisionEditionDemandeeMessage;
use App\MessageHandler\DecisionEditionDemandeeMessageHandler;
use App\Service\Signature\ParapheurFactice;
use DateTime;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class DecisionEditionDemandeeMessageHandlerTest extends KernelTestCase
{
    public function testInvoke(): void
    {
        self::bootKernel();
        $container = self::getContainer();

        $handler = $container->get(DecisionEditionDemandeeMessageHandler::class);
        $em = $container->get('doctrine')->getManager();

        // On cherche une décision existante pour le test
        $decision = $em->getRepository(DecisionAmenagementExamens::class)->findOneBy([]);

        if (null === $decision) {
            $this->markTestSkipped('No decision found in DB');
        }

        $message = new DecisionEditionDemandeeMessage($decision->getId(), 'admin');

        // On appelle le handler
        // Attention: cela va envoyer un mail et générer un PDF si les services ne sont pas mockés.
        // En environnement de test, le mailer est normalement mocké par Symfony.
        $handler->__invoke($message);

        $this->assertEquals(DecisionAmenagementExamens::ETAT_EDITE, $decision->getEtat());
    }

    public function testInvokeDepositsInParapheurWhenComposanteHasCircuit(): void
    {
        self::bootKernel();
        $container = self::getContainer();

        $handler = $container->get(DecisionEditionDemandeeMessageHandler::class);
        $parapheur = $container->get(ParapheurFactice::class);
        $em = $container->get('doctrine')->getManager();

        $decision = $em->getRepository(DecisionAmenagementExamens::class)->findOneBy([]);
        if (null === $decision) {
            $this->markTestSkipped('No decision found in DB');
        }
        $etatInitial = $decision->getEtat();

        // inscription en cours dans une composante reliée à un circuit
        $formation = $em->getRepository(Formation::class)->findOneBy(['codeExterne' => 'CODE_F_1']);
        $inscription = new Inscription()
            ->setFormation($formation)
            ->setDebut(new DateTime('-1 month'))
            ->setFin(new DateTime('+1 month'));
        $decision->getBeneficiaire()->addInscription($inscription);
        $formation->getComposante()->setCircuitSignature('circuit-test');
        $decision->setEtat(DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE);
        $em->persist($inscription);
        $em->flush();

        try {
            $handler->__invoke(new DecisionEditionDemandeeMessage($decision->getId(), 'admin'));

            $this->assertSame(DecisionAmenagementExamens::ETAT_EN_SIGNATURE, $decision->getEtat());
            $this->assertSame(DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE, $decision->getEtatSignature());
            $this->assertSame('circuit-test', $decision->getCircuitParapheur());
            $this->assertSame('admin', $decision->getUidDemandeurSignature());
            $documentId = $decision->getIdDocumentParapheur();
            $this->assertSame(
                DecisionAmenagementExamens::ETAT_SIGNATURE_EN_SIGNATURE,
                $parapheur->suivre($documentId)->etat,
            );
            // c'est le parapheur qui enverra la décision signée à l'étudiant
            $this->assertSame($decision->getBeneficiaire()->getEmail(), $parapheur->documents()[$documentId]['destinataire']);
            $this->assertEmailCount(0);

            // message rejoué : le document n'est pas déposé une seconde fois
            $handler->__invoke(new DecisionEditionDemandeeMessage($decision->getId(), 'admin'));

            $this->assertSame($documentId, $decision->getIdDocumentParapheur());
        } finally {
            // les autres tests attendent l'envoi par e-mail
            $formation->getComposante()->setCircuitSignature(null);
            $em->remove($inscription);
            $decision
                ->setEtat($etatInitial)
                ->setEtatSignature(null)
                ->setIdDocumentParapheur(null)
                ->setCircuitParapheur(null)
                ->setUidDemandeurSignature(null);
            $em->flush();
        }
    }
}
