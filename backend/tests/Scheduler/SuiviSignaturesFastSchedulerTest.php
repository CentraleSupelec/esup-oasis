<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Tests\Scheduler;

use App\Scheduler\SuiviSignaturesFast\SuiviSignaturesFastMessage;
use App\Scheduler\SuiviSignaturesFast\SuiviSignaturesFastScheduler;
use App\Service\Signature\FastParapheurClientFactice;
use App\Service\Signature\FastParapheurClientNonConfigure;
use PHPUnit\Framework\TestCase;
use Psr\Log\AbstractLogger;
use Psr\Log\NullLogger;
use Stringable;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\Scheduler\Generator\MessageContext;
use Symfony\Component\Scheduler\RecurringMessage;

final class SuiviSignaturesFastSchedulerTest extends TestCase
{
    public function testRienNEstPlanifieSansClientDisponible(): void
    {
        $scheduler = new SuiviSignaturesFastScheduler(
            new FastParapheurClientNonConfigure(),
            new ArrayAdapter(),
            new NullLogger(),
            '15 minutes',
        );

        self::assertSame([], $scheduler->getSchedule()->getRecurringMessages());
    }

    public function testLaFrequenceParDefautEstDUneHeure(): void
    {
        $passage = $this->seulPassage(new SuiviSignaturesFastScheduler(
            new FastParapheurClientFactice(),
            new ArrayAdapter(),
            new NullLogger(),
        ));

        self::assertStringContainsString('1 hour', (string) $passage->getTrigger());
    }

    public function testLaFrequenceEstReglable(): void
    {
        $passage = $this->seulPassage(new SuiviSignaturesFastScheduler(
            new FastParapheurClientFactice(),
            new ArrayAdapter(),
            new NullLogger(),
            '15 minutes',
        ));

        self::assertStringContainsString('15 minutes', (string) $passage->getTrigger());
    }

    public function testUneFrequenceInvalideRetombeSurLaValeurParDefaut(): void
    {
        $logger = new class extends AbstractLogger {
            /** @var string[] */
            public array $avertissements = [];

            public function log($level, string|Stringable $message, array $context = []): void
            {
                if ('warning' === $level) {
                    $this->avertissements[] = (string) $message;
                }
            }
        };

        $passage = $this->seulPassage(new SuiviSignaturesFastScheduler(
            new FastParapheurClientFactice(),
            new ArrayAdapter(),
            $logger,
            'toutes les lunes',
        ));

        self::assertStringContainsString('1 hour', (string) $passage->getTrigger());
        self::assertCount(1, $logger->avertissements);
    }

    public function testLePassageDeclencheLeSuiviDesSignatures(): void
    {
        $passage = $this->seulPassage(new SuiviSignaturesFastScheduler(
            new FastParapheurClientFactice(),
            new ArrayAdapter(),
            new NullLogger(),
        ));

        $contexte = new MessageContext('suivi_signatures_fast', 'id', $passage->getTrigger(), new \DateTimeImmutable());
        $messages = iterator_to_array($passage->getMessages($contexte));

        self::assertCount(1, $messages);
        self::assertInstanceOf(SuiviSignaturesFastMessage::class, $messages[0]);
    }

    private function seulPassage(SuiviSignaturesFastScheduler $scheduler): RecurringMessage
    {
        $passages = $scheduler->getSchedule()->getRecurringMessages();
        self::assertCount(1, $passages);

        return array_values($passages)[0];
    }
}
