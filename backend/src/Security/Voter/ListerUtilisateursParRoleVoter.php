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

use App\ApiResource\Utilisateur;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ListerUtilisateursParRoleVoter extends Voter
{
    public function __construct(
        private readonly Security $security,
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return Utilisateur::LIST_BY_ROLE === $attribute;
    }

    protected function voteOnAttribute(
        string $attribute,
        mixed $subject,
        TokenInterface $token,
        ?Vote $vote = null,
    ): bool {
        if ($this->security->isGranted(\App\Entity\Utilisateur::ROLE_ADMIN)) {
            return true;
        }
        if ($subject->attributes->get('roleId') === \App\Entity\Utilisateur::ROLE_ADMIN) {
            return false;
        }

        return $this->security->isGranted(\App\Entity\Utilisateur::ROLE_PLANIFICATEUR);
    }
}
