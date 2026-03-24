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

use App\ApiResource\Demande;
use App\Entity\Utilisateur;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

trait VoirDemandeTrait
{
    protected function peutVoirDemande(TokenInterface $token, Demande $demande): bool
    {
        //les gestionnaires et admins peuvent tout faire
        if (in_array(Utilisateur::ROLE_GESTIONNAIRE, $token->getRoleNames())) {
            return true;
        }

        //les renforts peuvent voir tous les types sans visibilité limitée
        if (
            in_array(Utilisateur::ROLE_RENFORT_DEMANDES, $token->getRoleNames())
            && !$demande->typeDemande->visibiliteLimitee
        ) {
            return true;
        }

        //les demandeurs peuvent voir leurs propres demandes
        if ($token->getUserIdentifier() === $demande->demandeur->uid) {
            return true;
        }

        //les membres de commission peuvent voir tout ce qui est lié aux mêmes commissions qu'eux
        if (
            null !== $demande->campagne->commission
            && in_array(Utilisateur::ROLE_MEMBRE_COMMISSION, $token->getRoleNames())
        ) {
            /**
             * @var Utilisateur $user
             */
            $user = $token->getUser();
            foreach ($user->getMembreCommissions() as $membreCommission) {
                if ($membreCommission->getCommission()->getId() === $demande->campagne->commission->id) {
                    return true;
                }
            }
        }

        return false;
    }
}
