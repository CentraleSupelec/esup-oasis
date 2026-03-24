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

namespace App\Command;

use App\Entity\AvisEse;
use App\Repository\UtilisateurRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:calcul-etats-ese',
    description: 'Initialisation de la version stockée du champ calculé etat avis ese des utilisateurs',
)]
class CalculEtatAvisEseCommand extends Command
{
    public function __construct(
        private readonly UtilisateurRepository $utilisateurRepository,
    ) {
        parent::__construct();
    }

    protected function configure(): void {}

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $existants = $this->utilisateurRepository->count([
            'etatAvisEse' => AvisEse::ETAT_AUCUN, //on a au moins ça sur les gestionnaires...
        ]);

        if ($existants > 0) {
            $io->info('Etats ESE déjà initialisés.');

            return Command::SUCCESS;
        }

        foreach ($this->utilisateurRepository->findAll() as $utilisateur) {
            $utilisateur->setEtatAvisEse($utilisateur->getEtatAvisEseCalcule());
            $this->utilisateurRepository->save($utilisateur);
        }

        $this->utilisateurRepository->save($utilisateur ?? null, true);

        $io->success('Etats ESE initialisés.');

        return Command::SUCCESS;
    }
}
