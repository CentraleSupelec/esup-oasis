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

namespace App\Scheduler\TestMailer;

use App\Service\MailService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
readonly class TestMailerHandler
{
    public function __construct(
        private MailService $mailService,
        private string $envoyer,
    ) {}

    public function __invoke(TestMailerMessage $message): void
    {
        if ($this->envoyer == 'true') {
            $this->mailService->envoyerMailTest();
        }
    }
}
