<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Scheduler\SuiviSignaturesFast;

use App\Service\Signature\FastParapheurClientInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Scheduler\Attribute\AsSchedule;
use Symfony\Component\Scheduler\Exception\InvalidArgumentException;
use Symfony\Component\Scheduler\RecurringMessage;
use Symfony\Component\Scheduler\Schedule;
use Symfony\Component\Scheduler\ScheduleProviderInterface;
use Symfony\Contracts\Cache\CacheInterface;

/**
 * Fréquence réglée par FAST_FREQUENCE_SUIVI (« 15 minutes », « 1 hour »…), une heure par défaut.
 */
#[AsSchedule('suivi_signatures_fast')]
readonly class SuiviSignaturesFastScheduler implements ScheduleProviderInterface
{
    public const string FREQUENCE_PAR_DEFAUT = '1 hour';

    public function __construct(
        private FastParapheurClientInterface $fastParapheurClient,
        private CacheInterface $cache,
        private LoggerInterface $logger,
        #[Autowire('%env(default::FAST_FREQUENCE_SUIVI)%')]
        private ?string $frequence = null,
    ) {}

    public function getSchedule(): Schedule
    {
        $schedule = new Schedule();

        // dépend du client et non de FAST_CIRCUITS : vider le mapping ne doit pas
        // abandonner le suivi des décisions déjà déposées
        if (!$this->fastParapheurClient->estDisponible()) {
            return $schedule;
        }

        return $schedule
            ->stateful($this->cache) // un passage manqué pendant un arrêt est rattrapé
            ->processOnlyLastMissedRun(true) // une seule fois, pas autant que de passages manqués
            ->add($this->passageRecurrent());
    }

    private function passageRecurrent(): RecurringMessage
    {
        $frequence = trim((string) $this->frequence);
        if ('' !== $frequence) {
            try {
                return RecurringMessage::every($frequence, new SuiviSignaturesFastMessage());
            } catch (InvalidArgumentException $e) {
                // Tous les traitements planifiés partagent le même processus de worker : une
                // fréquence mal saisie ne doit pas les empêcher de démarrer.
                $this->logger->warning(
                    'FAST_FREQUENCE_SUIVI invalide ({frequence}) : suivi des signatures planifié toutes les {defaut}.',
                    ['frequence' => $frequence, 'defaut' => self::FREQUENCE_PAR_DEFAUT, 'erreur' => $e->getMessage()],
                );
            }
        }

        return RecurringMessage::every(self::FREQUENCE_PAR_DEFAUT, new SuiviSignaturesFastMessage());
    }
}
