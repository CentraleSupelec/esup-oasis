<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Tests;

use App\ApiResource\Formation;
use App\ApiResource\Inscription;
use App\Entity\Composante;
use App\Entity\Utilisateur;
use App\Security\Voter\VoirInscriptionVoter;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;
use ReflectionProperty;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class VoirInscriptionVoterTest extends TestCase
{
    private VoirInscriptionVoter $voter;

    protected function setUp(): void
    {
        $this->voter = new VoirInscriptionVoter();
    }

    public function testPlanificateurCanSeeAnyInscriptionEntity(): void
    {
        $subject = $this->createMock(\App\Entity\Inscription::class);
        $subject->method('getId')->willReturn(123);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getRoleNames')->willReturn([Utilisateur::ROLE_PLANIFICATEUR]);

        $this->assertSame(VoterInterface::ACCESS_GRANTED, $this->voter->vote(
            $token,
            $subject,
            [Inscription::VOIR_INSCRIPTION],
        ));
    }

    public function testPlanificateurCanSeeAnyInscriptionResource(): void
    {
        $subject = new Inscription();
        $propId = new ReflectionProperty($subject, 'id');
        $propId->setValue($subject, 123);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getRoleNames')->willReturn([Utilisateur::ROLE_PLANIFICATEUR]);

        $this->assertSame(VoterInterface::ACCESS_GRANTED, $this->voter->vote(
            $token,
            $subject,
            [Inscription::VOIR_INSCRIPTION],
        ));
    }

    public function testStudentCanSeeTheirOwnInscriptionEntity(): void
    {
        $subject = $this->createMock(\App\Entity\Inscription::class);
        $subject->method('getId')->willReturn(123);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getRoleNames')->willReturn([Utilisateur::ROLE_BENEFICIAIRE]);

        $userCourant = $this->createMock(Utilisateur::class);
        $userInscription = $this->createMock(\App\Entity\Inscription::class);
        $userInscription->method('getId')->willReturn(123);
        $userCourant->method('getInscriptions')->willReturn(new ArrayCollection([$userInscription]));

        $token->method('getUser')->willReturn($userCourant);

        $this->assertSame(VoterInterface::ACCESS_GRANTED, $this->voter->vote(
            $token,
            $subject,
            [Inscription::VOIR_INSCRIPTION],
        ));
    }

    public function testStudentCanSeeTheirOwnInscriptionResource(): void
    {
        $subject = new Inscription();
        $propId = new ReflectionProperty($subject, 'id');
        $propId->setValue($subject, 123);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getRoleNames')->willReturn([Utilisateur::ROLE_BENEFICIAIRE]);

        $userCourant = $this->createMock(Utilisateur::class);
        $userInscription = $this->createMock(\App\Entity\Inscription::class);
        $userInscription->method('getId')->willReturn(123);
        $userCourant->method('getInscriptions')->willReturn(new ArrayCollection([$userInscription]));

        $token->method('getUser')->willReturn($userCourant);

        $this->assertSame(VoterInterface::ACCESS_GRANTED, $this->voter->vote(
            $token,
            $subject,
            [Inscription::VOIR_INSCRIPTION],
        ));
    }

    public function testStudentCannotSeeOtherInscriptions(): void
    {
        $subject = new Inscription();
        $propId = new ReflectionProperty($subject, 'id');
        $propId->setValue($subject, 123);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getRoleNames')->willReturn([Utilisateur::ROLE_BENEFICIAIRE]);

        $userCourant = $this->createMock(Utilisateur::class);
        $userInscription = $this->createMock(\App\Entity\Inscription::class);
        $userInscription->method('getId')->willReturn(456);
        $userCourant->method('getInscriptions')->willReturn(new ArrayCollection([$userInscription]));

        $token->method('getUser')->willReturn($userCourant);

        $this->assertSame(VoterInterface::ACCESS_DENIED, $this->voter->vote(
            $token,
            $subject,
            [Inscription::VOIR_INSCRIPTION],
        ));
    }

    public function testReferentComposanteCanSeeInscriptionInTheirComposanteEntity(): void
    {
        $composante = $this->createMock(Composante::class);
        $composante->method('getId')->willReturn(10);

        $formation = $this->createMock(\App\Entity\Formation::class);
        $formation->method('getComposante')->willReturn($composante);

        $subject = $this->createMock(\App\Entity\Inscription::class);
        $subject->method('getId')->willReturn(123);
        $subject->method('getFormation')->willReturn($formation);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getRoleNames')->willReturn([Utilisateur::ROLE_REFERENT_COMPOSANTE]);

        $userCourant = $this->createMock(Utilisateur::class);
        $userCourant->method('getInscriptions')->willReturn(new ArrayCollection());
        $userCourant->method('getComposantes')->willReturn(new ArrayCollection([$composante]));

        $token->method('getUser')->willReturn($userCourant);

        $this->assertSame(VoterInterface::ACCESS_GRANTED, $this->voter->vote(
            $token,
            $subject,
            [Inscription::VOIR_INSCRIPTION],
        ));
    }

    public function testReferentComposanteCanSeeInscriptionInTheirComposanteResource(): void
    {
        $composanteResource = new \App\ApiResource\Composante();
        $propCompId = new ReflectionProperty($composanteResource, 'id');
        $propCompId->setValue($composanteResource, 10);

        $formationResource = new Formation();
        $propComp = new ReflectionProperty($formationResource, 'composante');
        $propComp->setValue($formationResource, $composanteResource);

        $subject = new Inscription();
        $propId = new ReflectionProperty($subject, 'id');
        $propId->setValue($subject, 123);
        $propForm = new ReflectionProperty($subject, 'formation');
        $propForm->setValue($subject, $formationResource);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getRoleNames')->willReturn([Utilisateur::ROLE_REFERENT_COMPOSANTE]);

        $userCourant = $this->createMock(Utilisateur::class);
        $userCourant->method('getInscriptions')->willReturn(new ArrayCollection());
        
        $composanteEntity = $this->createMock(Composante::class);
        $composanteEntity->method('getId')->willReturn(10);
        $userCourant->method('getComposantes')->willReturn(new ArrayCollection([$composanteEntity]));

        $token->method('getUser')->willReturn($userCourant);

        $this->assertSame(VoterInterface::ACCESS_GRANTED, $this->voter->vote(
            $token,
            $subject,
            [Inscription::VOIR_INSCRIPTION],
        ));
    }

    public function testReferentComposanteCannotSeeInscriptionInOtherComposante(): void
    {
        $composanteResource = new \App\ApiResource\Composante();
        $propCompId = new ReflectionProperty($composanteResource, 'id');
        $propCompId->setValue($composanteResource, 10);

        $formationResource = new Formation();
        $propComp = new ReflectionProperty($formationResource, 'composante');
        $propComp->setValue($formationResource, $composanteResource);

        $subject = new Inscription();
        $propId = new ReflectionProperty($subject, 'id');
        $propId->setValue($subject, 123);
        $propForm = new ReflectionProperty($subject, 'formation');
        $propForm->setValue($subject, $formationResource);

        $token = $this->createMock(TokenInterface::class);
        $token->method('getRoleNames')->willReturn([Utilisateur::ROLE_REFERENT_COMPOSANTE]);

        $userCourant = $this->createMock(Utilisateur::class);
        $userCourant->method('getInscriptions')->willReturn(new ArrayCollection());
        
        $composanteEntity = $this->createMock(Composante::class);
        $composanteEntity->method('getId')->willReturn(20); // Different ID
        $userCourant->method('getComposantes')->willReturn(new ArrayCollection([$composanteEntity]));

        $token->method('getUser')->willReturn($userCourant);

        $this->assertSame(VoterInterface::ACCESS_DENIED, $this->voter->vote(
            $token,
            $subject,
            [Inscription::VOIR_INSCRIPTION],
        ));
    }
}
