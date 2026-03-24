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

use App\Entity\TypeEvenement;
use App\Repository\UtilisateurRepository;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:calcul-champ-gest',
    description: 'Initialisation du champs "gestionnaire" de la table utilisateur, qui ne sera plus calculé mais stocké.',
)]
class InitChampGestionnaireCommand extends Command
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
            'gestionnaire' => true, //au moins un gestionnaire, c'est déjà initialisé
        ]);

        if ($existants > 0) {
            $io->info('Champ gestionnaire déjà initialisé.');

            return Command::SUCCESS;
        }

        foreach ($this->utilisateurRepository->findAll() as $utilisateur) {
            if ($utilisateur->getServices()->count() > 0) {
                $renfort =
                    count(array_filter(
                        $utilisateur->getIntervenant()?->getTypesEvenements()->toArray() ?? [],
                        fn(TypeEvenement $type) => $type->getId() === TypeEvenement::TYPE_RENFORT,
                    )) > 0;
                if (!$renfort) {
                    $utilisateur->setGestionnaire(true);
                }
                //il faut forcer le recalcul des rôles dans tous les cas
                $this->utilisateurRepository->save($utilisateur);
            }
        }

        $this->utilisateurRepository->save($utilisateur ?? null, true);

        $io->success('Champs gestionnaire initialisé.');

        return Command::SUCCESS;
    }
}
