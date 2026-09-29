<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests;

use App\Entity\Amenagement;
use App\Entity\DecisionAmenagementExamens;
use App\Entity\Formation;
use App\Entity\Inscription;
use App\Entity\TypeAmenagement;
use App\Entity\Utilisateur;
use DateTime;

/**
 * Parcours de la décision avec un parapheur : la demande du gestionnaire part au parapheur, puis la
 * décision et ce qu'elle reprend ne changent plus jusqu'à la fin du circuit.
 */
class SignatureDecisionTest extends ApiTestCaseCustom
{
    private const string DECISION = '/utilisateurs/beneficiaire-decision/decisions/2025';

    private ?int $inscription = null;
    private ?int $amenagement = null;

    protected function tearDown(): void
    {
        // les fixtures servent aux autres classes de test : décision validée, sans circuit ni inscription ajoutée
        $manager = static::getContainer()->get('doctrine')->getManager();
        $decision = $this->decision();
        $decision->setEtat(DecisionAmenagementExamens::ETAT_VALIDE);
        $decision->setEtatSignature(null)->setIdDocumentParapheur(null)->setCircuitParapheur(null);
        $manager->getRepository(Formation::class)->findOneBy(['codeExterne' => 'CODE_F_1'])
            ->getComposante()->setCircuitSignature(null);
        if (null !== $this->inscription) {
            $manager->remove($manager->find(Inscription::class, $this->inscription));
        }
        if (null !== $this->amenagement) {
            $manager->remove($manager->find(Amenagement::class, $this->amenagement));
        }
        $manager->flush();

        parent::tearDown();
    }

    public function testGestionnaireRequestGoesToParapheurWhenComposanteHasCircuit(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $this->inscrireDansUneComposanteAvecCircuit();
        $this->etatDecision(DecisionAmenagementExamens::ETAT_ATTENTE_VALIDATION_CAS);

        $client->request('PATCH', self::DECISION, [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => ['etat' => DecisionAmenagementExamens::ETAT_VALIDE],
        ]);

        $this->assertResponseIsSuccessful();
        // le circuit remplace l'envoi par l'administrateur : le dépôt est demandé tout de suite
        $this->assertSame(DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE, $this->decision()->getEtat());
    }

    public function testGestionnaireRequestAwaitsAdministrateurWithoutCircuit(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $this->etatDecision(DecisionAmenagementExamens::ETAT_ATTENTE_VALIDATION_CAS);

        $client->request('PATCH', self::DECISION, [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => ['etat' => DecisionAmenagementExamens::ETAT_VALIDE],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSame(DecisionAmenagementExamens::ETAT_VALIDE, $this->decision()->getEtat());
    }

    public function testDecisionEnSignatureCannotBeModified(): void
    {
        $client = $this->createClientWithCredentials('admin');
        $this->etatDecision(DecisionAmenagementExamens::ETAT_EN_SIGNATURE);

        $client->request('PATCH', self::DECISION, [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => ['etat' => DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE],
        ]);

        $this->assertResponseStatusCodeSame(403);
        $this->assertSame(DecisionAmenagementExamens::ETAT_EN_SIGNATURE, $this->decision()->getEtat());
    }

    public function testRefusedDecisionCanBeRequestedAgain(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $this->inscrireDansUneComposanteAvecCircuit();
        $this->etatDecision(DecisionAmenagementExamens::ETAT_REFUSEE);

        $client->request('PATCH', self::DECISION, [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => ['etat' => DecisionAmenagementExamens::ETAT_VALIDE],
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSame(DecisionAmenagementExamens::ETAT_EDITION_DEMANDEE, $this->decision()->getEtat());
    }

    public function testAmenagementInDecisionIsLockedWhileEnSignature(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $this->etatDecision(DecisionAmenagementExamens::ETAT_EN_SIGNATURE);

        $client->request('PATCH', '/utilisateurs/beneficiaire-decision/amenagements/' . $this->amenagementDecision(), [
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => ['commentaire' => 'Salle isolée'],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    public function testAvisEseIsLockedWhileDecisionEnSignature(): void
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $this->etatDecision(DecisionAmenagementExamens::ETAT_EN_SIGNATURE);

        $client->request('POST', '/utilisateurs/beneficiaire-decision/avis_ese', [
            'json' => [
                'libelle' => 'Avis pendant la signature',
                'debut' => new DateTime()->format('Y-m-d'),
            ],
        ]);

        $this->assertResponseStatusCodeSame(422);
    }

    /** La décision 2025 visée par l'URI : le bénéficiaire en a aussi une pour l'année en cours. */
    private function decision(): DecisionAmenagementExamens
    {
        $manager = static::getContainer()->get('doctrine')->getManager();
        $manager->clear();
        $beneficiaire = $manager->getRepository(Utilisateur::class)->findOneBy(['uid' => 'beneficiaire-decision']);

        return $manager->getRepository(DecisionAmenagementExamens::class)->findOneBy([
            'beneficiaire' => $beneficiaire,
            'debut' => new DateTime('2025-09-01'),
        ]);
    }

    /** Après la création du client : la requête passe par la connexion de son noyau. */
    private function etatDecision(string $etat): void
    {
        $decision = $this->decision();
        $decision->setEtat($etat);
        if (DecisionAmenagementExamens::ETAT_EN_SIGNATURE === $etat) {
            $decision->setIdDocumentParapheur(uniqid('factice-', true));
        }
        static::getContainer()->get('doctrine')->getManager()->flush();
    }

    private function inscrireDansUneComposanteAvecCircuit(): void
    {
        $manager = static::getContainer()->get('doctrine')->getManager();
        $formation = $manager->getRepository(Formation::class)->findOneBy(['codeExterne' => 'CODE_F_1']);
        $formation->getComposante()->setCircuitSignature('circuit-test');

        $inscription = new Inscription()
            ->setFormation($formation)
            ->setDebut(new DateTime('-1 month'))
            ->setFin(new DateTime('+1 month'));
        $manager->getRepository(Utilisateur::class)->findOneBy(['uid' => 'beneficiaire-decision'])
            ->addInscription($inscription);
        $manager->persist($inscription);
        $manager->flush();
        $this->inscription = $inscription->getId();
    }

    /** Un aménagement d'examens du bénéficiaire, d'un type inclus dans la décision. */
    private function amenagementDecision(): int
    {
        $manager = static::getContainer()->get('doctrine')->getManager();
        $utilisateur = $manager->getRepository(Utilisateur::class)->findOneBy(['uid' => 'beneficiaire-decision']);
        $type = $manager->getRepository(TypeAmenagement::class)->findOneBy(['examens' => true]);
        $type->setDecision(true);

        // créé ici : les autres classes de test modifient les aménagements des fixtures
        $amenagement = new Amenagement();
        $amenagement->setType($type);
        $amenagement->setDebut(new DateTime('-1 month'));
        $amenagement->setFin(new DateTime('+1 month'));
        $amenagement->setSemestre1(true);
        $amenagement->setSemestre2(true);
        $amenagement->addBeneficiaire($utilisateur->getBeneficiaires()->first());
        $manager->persist($amenagement);
        $manager->flush();
        $this->amenagement = $amenagement->getId();

        return $this->amenagement;
    }
}
