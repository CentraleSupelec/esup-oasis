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

namespace App\Security\Voter;

use App\ApiResource\Inscription;
use App\Entity\Utilisateur;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class VoirInscriptionVoter extends Voter
{
    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === Inscription::VOIR_INSCRIPTION
            && ($subject instanceof Inscription || $subject instanceof \App\Entity\Inscription);
    }

    protected function voteOnAttribute(
        string $attribute,
        mixed $subject,
        TokenInterface $token,
        ?Vote $vote = null,
    ): bool {
        // 1. Rôle planificateur
        if (in_array(Utilisateur::ROLE_PLANIFICATEUR, $token->getRoleNames())) {
            return true;
        }

        // Récupération des IDs
        $inscriptionId = null;

        if ($subject instanceof Inscription) {
            $inscriptionId = $subject->id;
        } elseif ($subject instanceof \App\Entity\Inscription) {
            $inscriptionId = $subject->getId();
        }

        if ($inscriptionId === null) {
            return false;
        }

        /** @var Utilisateur $utilisateurCourant */
        $utilisateurCourant = $token->getUser();

        if ($utilisateurCourant === null) {
            return false;
        }

        // 2. Être l'étudiant concerné
        foreach ($utilisateurCourant->getInscriptions() as $userInscription) {
            if ($userInscription->getId() === $inscriptionId) {
                return true;
            }
        }

        // 3. Rôle référent de composante pour la composante de l'inscription
        if (in_array(Utilisateur::ROLE_REFERENT_COMPOSANTE, $token->getRoleNames())) {
            $composanteId = null;
            if ($subject instanceof Inscription) {
                try {
                    $composanteId = $subject->formation?->composante?->id;
                } catch (\Error) {
                    $composanteId = null;
                }
            } elseif ($subject instanceof \App\Entity\Inscription) {
                $composanteId = $subject->getFormation()?->getComposante()?->getId();
            }

            if ($composanteId !== null) {
                foreach ($utilisateurCourant->getComposantes() as $composanteEntity) {
                    if ($composanteEntity->getId() === $composanteId) {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}