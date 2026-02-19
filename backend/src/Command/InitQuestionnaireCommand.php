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

use App\Entity\Question;
use Doctrine\ORM\EntityManagerInterface;
use Fidry\AliceDataFixtures\Loader\PurgerLoader;
use Fidry\AliceDataFixtures\Persistence\PurgeMode;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:init-questionnaire', description: 'initialisation du questionnaire')]
class InitQuestionnaireCommand extends Command
{
    protected array $fixtures;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly PurgerLoader $loader,
    ) {
        $this->fixtures = [
            'etapes_demandes',
            'options_reponses',
            'questions',
            'questions_etapes_demandes',
            'types_demandes',
        ];

        parent::__construct('app:init-questionnaire');
    }

    protected function configure(): void {}

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        //check if necessary
        $questions = $this->entityManager->getRepository(Question::class)->findAll();
        if (count($questions) > 0) {
            $io->warning('Questionnaire déjà initialisé.');
            return Command::SUCCESS;
        }

        $fixtures = array_map(
            fn($path) => __DIR__ . '/../../fixtures/questionnaire/' . $path . '.yaml',
            $this->fixtures,
        );
        $this->loader->load(fixturesFiles: $fixtures, purgeMode: PurgeMode::createNoPurgeMode());

        $io->success('Chargement du questionnaire réussi');

        return Command::SUCCESS;
    }
}
