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

use App\Message\DemandeAttenteValidationAccompagnementMessage;
use App\Service\MailService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler(handles: DemandeAttenteValidationAccompagnementMessage::class)]
readonly class DemandeAttenteValidationAccompagnementMessageHandler
{
    public function __construct(
        private MailService $mailService,
    ) {}

    public function __invoke(DemandeAttenteValidationAccompagnementMessage $message): void
    {
        $this->mailService->envoyerPrendreContact($message->getDemandeur(), $message->getTypeDemande());
    }
}
