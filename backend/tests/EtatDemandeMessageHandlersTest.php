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

use App\Entity\Demande;
use App\Entity\ProfilBeneficiaire;
use App\Entity\Utilisateur;
use App\Message\DemandeAttenteValidationCharteMessage;
use App\Message\DemandeNonConformeMessage;
use App\Message\DemandeValideeMessage;
use App\Message\EtatDemandeModifieMessage;
use App\MessageHandler\DemandeAttenteValidationCharteMessageHandler;
use App\MessageHandler\DemandeNonConformeMessageHandler;
use App\MessageHandler\DemandeValideeMessageHandler;
use App\State\Demande\DemandeManager;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class EtatDemandeMessageHandlersTest extends KernelTestCase
{
    private function getMessage(Demande $demande, ?int $idProfil = null, ?string $commentaire = null): array
    {
        $container = self::getContainer();
        $demandeManager = $container->get(DemandeManager::class);

        $etatMessage = new EtatDemandeModifieMessage(
            idDemande: $demande->getId(),
            idEtatprecedent: $demande->getEtat()->getId(),
            idEtat: 1, // dummy
            uidUtilisateurModif: $demande->getDemandeur()->getUid(),
            commentaire: $commentaire,
            idProfil: $idProfil
        );

        return [$etatMessage, $demandeManager];
    }

    public function testDemandeValideeHandler(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $em = $container->get('doctrine')->getManager();
        
        $demande = $em->getRepository(Demande::class)->createQueryBuilder('d')
            ->leftJoin(\App\Entity\Beneficiaire::class, 'b', 'WITH', 'b.demande = d')
            ->where('b.id IS NULL')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
        
        $profil = $em->getRepository(ProfilBeneficiaire::class)->findOneBy([]);
        
        if (!$demande || !$profil) {
            $this->markTestSkipped('No suitable demande or profil found');
        }

        [$etatMessage, $demandeManager] = $this->getMessage($demande, $profil->getId());
        $message = new DemandeValideeMessage($etatMessage, $demandeManager);

        $handler = $container->get(DemandeValideeMessageHandler::class);
        $handler->__invoke($message);

        $user = $em->getRepository(Utilisateur::class)->find($demande->getDemandeur()->getId());
        $hasProfil = false;
        foreach ($user->getBeneficiaires() as $beneficiaire) {
            if ($beneficiaire->getProfil()->getId() === $profil->getId()) {
                $hasProfil = true;
                break;
            }
        }
        $this->assertTrue($hasProfil);
    }

    public function testDemandeNonConformeHandler(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $em = $container->get('doctrine')->getManager();
        
        $demande = $em->getRepository(Demande::class)->findOneBy([]);
        
        [$etatMessage, $demandeManager] = $this->getMessage($demande, null, 'Pas bien');
        $message = new DemandeNonConformeMessage($etatMessage, $demandeManager);

        $handler = $container->get(DemandeNonConformeMessageHandler::class);
        $handler->__invoke($message);

        $this->assertEmailCount(1);
    }

    public function testDemandeAttenteValidationCharteHandler(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        $em = $container->get('doctrine')->getManager();
        
        $demande = $em->getRepository(Demande::class)->findOneBy([]);
        
        [$etatMessage, $demandeManager] = $this->getMessage($demande);
        $message = new DemandeAttenteValidationCharteMessage($etatMessage, $demandeManager);

        $handler = $container->get(DemandeAttenteValidationCharteMessageHandler::class);
        $handler->__invoke($message);

        $this->assertEmailCount(1);
    }
}
