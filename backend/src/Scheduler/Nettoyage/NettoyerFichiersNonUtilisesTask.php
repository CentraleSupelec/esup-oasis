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

namespace App\Scheduler\Nettoyage;

use App\Repository\FichierRepository;
use App\Service\FileStorage\StorageProviderInterface;
use App\Service\MailService;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Symfony\Component\Scheduler\Attribute\AsPeriodicTask;

#[AsPeriodicTask(frequency: '1 day', from: '01:30', jitter: 300, schedule: 'nettoyage')]
readonly class NettoyerFichiersNonUtilisesTask
{
    public function __construct(
        private StorageProviderInterface $storageProvider,
        private FichierRepository $fichierRepository,
        private LoggerInterface $logger,
        private MailService $mailService,
    ) {}

    public function __invoke(): void
    {
        $removed = 0;
        $errors = 0;

        $obsoleteFiles = $this->fichierRepository->fichiersObsoletes();
        foreach ($obsoleteFiles as $file) {
            try {
                $this->storageProvider->delete($file->getMetadata());
                $this->fichierRepository->remove($file, true);
                $removed++;
            } catch (RuntimeException $e) {
                $this->logger->error($e->getMessage());
                $this->logger->info($e->getTraceAsString());
                $errors++;
            }
        }

        if ($errors > 0) {
            $this->mailService->envoyerRapportNettoyage(count($obsoleteFiles), $removed, $errors);
        }
    }
}
