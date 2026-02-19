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

namespace App\State\Parametre;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\ValeurParametre;
use App\Message\RessourceCollectionModifieeMessage;
use App\Message\RessourceModifieeMessage;
use App\Repository\FichierRepository;
use App\Repository\ParametreRepository;
use App\Repository\ValeurParametreRepository;
use Exception;
use Symfony\Component\Messenger\MessageBusInterface;

readonly class ValeurParametreProcessor implements ProcessorInterface
{
    public function __construct(
        private ParametreRepository $parametreRepository,
        private ValeurParametreRepository $valeurParametreRepository,
        private FichierRepository $fichierRepository,
        private MessageBusInterface $messageBus,
    ) {}

    /**
     * @param ValeurParametre $data
     * @param Operation       $operation
     * @param array           $uriVariables
     * @param array           $context
     * @return ValeurParametre
     * @throws Exception
     */
    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = [],
    ): ValeurParametre {
        $parametre = $this->parametreRepository->findOneBy([
            'cle' => $uriVariables['cle'],
        ]);

        if (null === $data->id) {
            $entity = new \App\Entity\ValeurParametre();
            $parametre->addValeursParametre($entity);
        } else {
            $entity = $this->valeurParametreRepository->find($data->id);
        }
        $entity->setValeur($data->valeur);
        $fichier = match ($data->fichier) {
            null => null,
            default => $this->fichierRepository->find($data->fichier->id),
        };
        $entity->setFichier($fichier);
        $entity->setDebut($data->debut);
        $entity->setFin($data->fin);

        $this->parametreRepository->save($parametre, true);

        return new ValeurParametre($entity);
    }
}
