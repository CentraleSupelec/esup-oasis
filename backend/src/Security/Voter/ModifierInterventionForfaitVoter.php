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

use App\ApiResource\InterventionForfait;
use App\Entity\Utilisateur;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class ModifierInterventionForfaitVoter extends Voter
{
    use ClockAwareTrait;

    public function __construct(
        private readonly Security $security,
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === InterventionForfait::MODIFIER_INTERVENTION && is_array($subject);
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
        [$previous, $new] = $subject;

        if (!$this->security->isGranted(Utilisateur::ROLE_PLANIFICATEUR)) {
            return false;
        }

        if ($previous->periode->envoyee || $previous->periode->butoir->format('Ymd') < $this->now()->format('Ymd')) {
            //on ne peut plus toucher qu'à la liste des bénéficiaires
            if (
                $new->type->id !== $previous->type->id
                || $new->periode->id !== $previous->periode->id
                || $new->heures !== $previous->heures
                || $new->intervenant->uid !== $previous->intervenant->uid
            ) {
                return false;
            }
        }

        return true;
    }
}
