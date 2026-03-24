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

namespace App\Scheduler\CalculRoles;

use App\Repository\UtilisateurRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Scheduler\Attribute\AsPeriodicTask;

#[AsPeriodicTask(frequency: '12 hours', from: '1:00', jitter: '300', schedule: 'calcul_roles')]
readonly class CalculRoles
{
    public function __construct(
        private UtilisateurRepository $utilisateurRepository,
        private LoggerInterface $logger,
    ) {}

    public function __invoke(): void
    {
        foreach ($this->utilisateurRepository->findAll() as $utilisateur) {
            $utilisateur->setRoles($utilisateur->getRolesCalcules());
            $this->utilisateurRepository->save($utilisateur);
        }

        $this->utilisateurRepository->save($utilisateur ?? null, true);

        $this->logger->info('Fin du traitement de maj des roles stockés');
    }
}
