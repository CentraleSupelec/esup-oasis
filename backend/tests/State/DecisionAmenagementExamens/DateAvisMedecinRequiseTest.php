<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests\State\DecisionAmenagementExamens;

use App\Entity\Beneficiaire;
use App\Entity\DecisionAmenagementExamens;
use App\Entity\ProfilBeneficiaire;
use App\Entity\Utilisateur;
use App\Message\RessourceModifieeMessage;
use App\Repository\DecisionAmenagementExamensRepository;
use App\State\DecisionAmenagementExamens\DecisionAmenagementManager;
use DateTime;
use PHPUnit\Framework\TestCase;
use DateTimeImmutable;
use ReflectionClass;
use stdClass;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

final class DateAvisMedecinRequiseTest extends TestCase
{
    // la règle ne lit que la décision : pas besoin des dépendances du manager
    private function manager(): DecisionAmenagementManager
    {
        return new ReflectionClass(DecisionAmenagementManager::class)->newInstanceWithoutConstructor();
    }

    public function testNoProfilRequiresMedicalOpinionByDefault(): void
    {
        // instance qui n'a rien paramétré : comportement historique
        $decision = $this->decisionPour($this->profil(avisMedicalRequis: false));

        self::assertFalse($this->manager()->dateAvisMedecinRequise($decision));
    }

    public function testProfilWithOptionRequiresMedicalOpinion(): void
    {
        $decision = $this->decisionPour($this->profil(avisMedicalRequis: true));

        self::assertTrue($this->manager()->dateAvisMedecinRequise($decision));
    }

    public function testOneProfilWithOptionIsEnough(): void
    {
        // sportif de haut niveau et en situation de handicap : le second profil l'emporte
        $decision = $this->decisionPour(
            $this->profil(avisMedicalRequis: false),
            $this->profil(avisMedicalRequis: true),
        );

        self::assertTrue($this->manager()->dateAvisMedecinRequise($decision));
    }

    public function testProfilOutsideDecisionPeriodDoesNotCount(): void
    {
        // profil de handicap clos avant l'année de la décision
        $decision = $this->decisionPour(
            $this->profil(avisMedicalRequis: true, debut: '2023-09-01', fin: '2024-08-31'),
        );

        self::assertFalse($this->manager()->dateAvisMedecinRequise($decision));
    }

    public function testProfilWithoutTypologieNeverRequiresMedicalOpinion(): void
    {
        // case restée cochée sur un profil qui n'est plus un profil de handicap
        $decision = $this->decisionPour($this->profil(avisMedicalRequis: true, avecTypologie: false));

        self::assertFalse($this->manager()->dateAvisMedecinRequise($decision));
    }

    public function testProfilCountsWithoutAccompagnement(): void
    {
        // des aménagements d'examens sans accompagnement restent soumis à l'avis médical
        $decision = $this->decisionPour(
            $this->profil(avisMedicalRequis: true, avecAccompagnement: false),
        );

        self::assertTrue($this->manager()->dateAvisMedecinRequise($decision));
    }

    public function testPendingDecisionsOfTheProfilAreInvalidated(): void
    {
        $profil = new ProfilBeneficiaire();
        $repository = $this->createMock(DecisionAmenagementExamensRepository::class);
        $repository->expects(self::once())
            ->method('nonEnvoyeesParProfil')
            ->with($profil, new DateTime('2025-09-01'))
            ->willReturn([new DecisionAmenagementExamens(), new DecisionAmenagementExamens()]);
        $bus = $this->createMock(MessageBusInterface::class);
        $bus->expects(self::exactly(2))
            ->method('dispatch')
            ->with(self::isInstanceOf(RessourceModifieeMessage::class))
            ->willReturn(new Envelope(new stdClass()));

        // UtilisateurManager, readonly, n'est pas doublable : seuls le dépôt et le bus servent ici
        $reflection = new ReflectionClass(DecisionAmenagementManager::class);
        $manager = $reflection->newInstanceWithoutConstructor();
        $reflection->getProperty('decisionAmenagementExamensRepository')->setValue($manager, $repository);
        $reflection->getProperty('messageBus')->setValue($manager, $bus);
        $manager->setClock(new MockClock(new DateTimeImmutable('2026-01-15')));

        $manager->invaliderDecisionsNonEnvoyees($profil);
    }

    private function profil(
        bool $avisMedicalRequis,
        string $debut = '2025-09-01',
        ?string $fin = '2026-08-31',
        bool $avecAccompagnement = true,
        bool $avecTypologie = true,
    ): Beneficiaire {
        $profil = (new ProfilBeneficiaire())
            ->setAvisMedicalRequis($avisMedicalRequis)
            ->setAvecTypologie($avecTypologie);

        return (new Beneficiaire())
            ->setProfil($profil)
            ->setDebut(new DateTime($debut))
            ->setFin(null === $fin ? null : new DateTime($fin))
            ->setAvecAccompagnement($avecAccompagnement);
    }

    private function decisionPour(Beneficiaire ...$profils): DecisionAmenagementExamens
    {
        $utilisateur = new Utilisateur();
        foreach ($profils as $profil) {
            $utilisateur->addBeneficiaire($profil);
        }

        return (new DecisionAmenagementExamens())
            ->setBeneficiaire($utilisateur)
            ->setDebut(new DateTime('2025-09-01'))
            ->setFin(new DateTime('2026-08-31'));
    }
}
