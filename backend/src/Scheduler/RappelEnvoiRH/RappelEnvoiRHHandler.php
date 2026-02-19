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

namespace App\Scheduler\RappelEnvoiRH;

use App\Repository\PeriodeRHRepository;
use App\Service\MailService;
use Doctrine\ORM\NonUniqueResultException;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class RappelEnvoiRHHandler
{
    use ClockAwareTrait;

    public const int DECLENCHER_J_MOINS = 4;

    public function __construct(
        private readonly PeriodeRHRepository $periodeRHRepository,
        private readonly MailService $mailService,
    ) {}

    /**
     * @param RappelEnvoiRHMessage $message
     * @return void
     * @throws NonUniqueResultException
     */
    public function __invoke(RappelEnvoiRHMessage $message): void
    {
        /**
         * On va vérifier si on est à J - self::DECLENCHER_J_MOINS
         */
        $now = $this->now();
        $periodeRH = $this->periodeRHRepository->findPeriodePourDate($now);
        if (null === $periodeRH) {
            //aucune période en cours...on évite de polluer les logs d'erreur de test avec ça
            return;
        }
        $dateButoirPeriode = $periodeRH->getButoir();

        if (
            $now->format('Y-m-d') == (clone $dateButoirPeriode)->modify('-'
            . self::DECLENCHER_J_MOINS
            . 'days')->format('Y-m-d')
        ) {
            //on est dans la fenêtre de déclenchement
            $this->mailService->envoyerRappelsEnvoiRH($periodeRH);
            $this->mailService->envoyerRappelValidationInterventionsRenforts($periodeRH);
        }
    }
}
