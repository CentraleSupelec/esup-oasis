<?php

namespace App\Tests;

use App\Entity\DecisionAmenagementExamens;
use App\Entity\PeriodeRH;
use App\Entity\ProfilBeneficiaire;
use App\Entity\Utilisateur;
use App\Service\MailService;

class MailServiceTest extends ApiTestCaseCustom
{
    public function testEnvoyerMailTest(): void
    {
        $container = static::getContainer();

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerMailTest();

        $this->assertEmailCount(1);
    }

    public function testEnvoyerRappelIntervenant(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $evenement = $em->getRepository(\App\Entity\Evenement::class)->createQueryBuilder('e')
            ->where('e.intervenant IS NOT NULL')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if (null === $evenement) {
            $this->markTestSkipped('No evenement with intervenant found in DB');
        }

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerRappelIntervenant([$evenement]);
        $this->assertTrue(true);
    }

    public function testEnvoyerRappelBeneficiaire(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $evenement = $em->getRepository(\App\Entity\Evenement::class)->createQueryBuilder('e')
            ->join('e.beneficiaires', 'b')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();

        if (null === $evenement) {
            $this->markTestSkipped('No evenement with beneficiaries found in DB');
        }
        $beneficiaire = $evenement->getBeneficiaires()[0]->getUtilisateur();

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerRappelBeneficiaire($beneficiaire, [$evenement]);
        $this->assertTrue(true);
    }
    public function testEnvoyerRapportMajInscriptions(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $admin = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'admin']);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerRapportMajInscriptions([$admin], []);
        $this->assertTrue(true);
    }

    public function testEnvoyerMessageBienvenue(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $intervenant = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'intervenant']);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerMessageBienvenue($intervenant);
        $this->assertTrue(true);
    }

    public function testEnvoyerConfirmationDemandeReceptionnee(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $demandeur = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);
        $typeDemande = $em->getRepository(\App\Entity\TypeDemande::class)->find(1);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerConfirmationDemandeReceptionnee($demandeur, $typeDemande);
        $this->assertTrue(true);
    }

    public function testEnvoyerMessageDemandeNonConforme(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $demandeur = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);
        $typeDemande = $em->getRepository(\App\Entity\TypeDemande::class)->find(1);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerMessageDemandeNonConforme($demandeur, $typeDemande, 'Commentaire');
        $this->assertTrue(true);
    }

    public function testEnvoyerConfirmationDemandeValidee(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $demandeur = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);
        $typeDemande = $em->getRepository(\App\Entity\TypeDemande::class)->find(1);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerConfirmationDemandeValidee($demandeur, $typeDemande);
        $this->assertTrue(true);
    }

    public function testEnvoyerNotificationRefusDemande(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $demandeur = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);
        $typeDemande = $em->getRepository(\App\Entity\TypeDemande::class)->find(1);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerNotificationRefusDemande($demandeur, $typeDemande, 'Refusé');
        $this->assertTrue(true);
    }

    public function testEnvoyerConfirmationDemandeStatutValide(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $demandeur = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);
        $typeDemande = $em->getRepository(\App\Entity\TypeDemande::class)->find(1);
        $profil = $em->getRepository(ProfilBeneficiaire::class)->find(1);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerConfirmationDemandeStatutValide($demandeur, $typeDemande, $profil, true);
        $this->assertTrue(true);
    }

    public function testEnvoyerCharteAValider(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $demandeur = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);
        $typeDemande = $em->getRepository(\App\Entity\TypeDemande::class)->find(1);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerCharteAValider($demandeur, $typeDemande);
        $this->assertTrue(true);
    }

    public function testEnvoyerPrendreContact(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $demandeur = $em->getRepository(Utilisateur::class)->findOneBy(['uid' => 'demandeur']);
        $typeDemande = $em->getRepository(\App\Entity\TypeDemande::class)->find(1);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerPrendreContact($demandeur, $typeDemande);
        $this->assertTrue(true);
    }

    public function testEnvoyerMailErreurTechnique(): void
    {
        $container = static::getContainer();

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $message = new \App\Message\ErreurTechniqueMessage(new \Exception('Error message'), 'Oups');
        $mailService->envoyerMailErreurTechnique($message);
        $this->assertTrue(true);
    }

    public function testEnvoyerDecision(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $decision = $em->getRepository(DecisionAmenagementExamens::class)->findOneBy([]);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerDecision($decision, 'dummy pdf content');
        $this->assertTrue(true);
    }

    public function testEnvoyerRapportNettoyage(): void
    {
        $container = static::getContainer();

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerRapportNettoyage(10, 8, 2);
        $this->assertTrue(true);
    }

    public function testEnvoyerRappelsEnvoiRH(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $periode = $em->getRepository(PeriodeRH::class)->findOneBy([]);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerRappelsEnvoiRH($periode);
        $this->assertTrue(true);
    }

    public function testEnvoyerRappelValidationInterventionsRenforts(): void
    {
        $container = static::getContainer();
        $em = $container->get('doctrine')->getManager();
        $periode = $em->getRepository(PeriodeRH::class)->findOneBy([]);

        /** @var MailService $mailService */
        $mailService = $container->get(MailService::class);

        $mailService->envoyerRappelValidationInterventionsRenforts($periode);
        $this->assertTrue(true);
    }
}
