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

use App\Message\CreationIntervenantMessage;
use App\Service\MailService;
use App\State\Utilisateur\UtilisateurManager;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
readonly class CreationIntervenantMessageHandler
{
    public function __construct(
        private MailService $mailService,
        private UtilisateurManager $utilisateurManager,
    ) {}

    public function __invoke(CreationIntervenantMessage $message): void
    {
        $intervenant = $this->utilisateurManager->parUid($message->getIntervenantUid());

        //messsage d'informations
        $this->mailService->envoyerMessageBienvenue($intervenant);

        //récupération des inscriptions / nuémro de tel si possible
        $debut = $intervenant->getIntervenant()->getDebut();
        $fin = $intervenant->getIntervenant()->getFin();
        $this->utilisateurManager->majInscriptionsEtIdentite($intervenant, $debut, $fin);
    }
}
