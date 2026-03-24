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

use App\Entity\Parametre;
use App\Repository\ParametreRepository;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\Scheduler\Attribute\AsSchedule;
use Symfony\Component\Scheduler\RecurringMessage;
use Symfony\Component\Scheduler\Schedule;
use Symfony\Component\Scheduler\ScheduleProviderInterface;
use Symfony\Contracts\Cache\CacheInterface;

#[AsSchedule('rappelEnvoiRH')]
class RappelEnvoiRHScheduler implements ScheduleProviderInterface
{
    use ClockAwareTrait;

    public function __construct(
        private readonly ParametreRepository $parametreRepository,
        private readonly string $heurePassage,
        private readonly string $startScheduleNow,
        private readonly CacheInterface $cache,
    ) {}

    public function getSchedule(): Schedule
    {
        $frequency = $this->parametreRepository->findOneBy([
            'cle' => Parametre::FREQUENCE_RAPPEL_ENVOI_RH,
        ]);

        $from = $this->startScheduleNow == 'true' ? $this->now() : $this->heurePassage;

        return new Schedule()
            ->stateful($this->cache) // ensure missed tasks are executed
            ->processOnlyLastMissedRun(true) // ensure only last missed task is run
            ->add(RecurringMessage::every(
                frequency: $frequency?->getValeurCourante()->getValeur() ?? '1 day',
                message: new RappelEnvoiRHMessage(),
                from: $from,
            ));
    }
}
