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

namespace App\MessageHandler;

use App\Entity\EtatDemande;
use App\Message\DemandeConformeMessage;
use App\State\Demande\DemandeManager;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler(handles: DemandeConformeMessage::class, priority: 20)]
readonly class DemandeConformeMessageHandler
{
    function __construct(
        private DemandeManager $demandeManager,
    ) {}

    public function __invoke(DemandeConformeMessage $message): void
    {
        /**
         * Si un seul profil et pas de commission, on passe à l'état VALIDE!
         */
        $demande = $message->getDemande();
        $profilsAssocies = $message->getTypeDemande()->getProfilsAssocies();
        if (count($profilsAssocies) == 1 && null == $demande->getCampagne()->getCommission()) {
            $this->demandeManager->modifierDemande(
                demande: $demande,
                idEtat: EtatDemande::PROFIL_VALIDE,
                commentaire: $message->getCommentaire(),
                profilId: $profilsAssocies->current()->getId(),
                user: $message->getUidUtilisateur(),
            );
        }
    }
}
