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

namespace App\Security\Voter;

use App\ApiResource\Evenement;
use App\Entity\ApplicationCliente;
use App\Entity\Utilisateur;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class VoirEvenementVoter extends Voter
{
    public function __construct(
        private readonly Security $security,
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return Evenement::VOIR === $attribute;
    }

    /**
     * @param string $attribute
     * @param mixed $subject
     * @param TokenInterface $token
     * @param Vote|null $vote* @return bool
     */
    protected function voteOnAttribute(
        string $attribute,
        mixed $subject,
        TokenInterface $token,
        ?Vote $vote = null,
    ): bool {
        //planificateurs
        if ($this->security->isGranted(Utilisateur::ROLE_PLANIFICATEUR)) {
            return true;
        }

        //Applications clientes déclarées
        if ($this->security->isGranted(ApplicationCliente::ROLE_APPLICATION_CLIENTE)) {
            return true;
        }

        //intervenant
        $userIdentifier = $this->security->getUser()->getUserIdentifier();
        if ($userIdentifier === $subject->intervenant?->uid) {
            return true;
        }

        //bénéficiaire
        return count(array_filter($subject->beneficiaires, fn($benef) => $benef->uid === $userIdentifier)) > 0;
    }
}
