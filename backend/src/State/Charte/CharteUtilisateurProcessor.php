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

namespace App\State\Charte;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\CharteUtilisateur;
use App\Message\CharteValideeMessage;
use App\Message\RessourceModifieeMessage;
use App\Repository\CharteDemandeurRepository;
use Exception;
use Override;
use Symfony\Component\Messenger\MessageBusInterface;

readonly class CharteUtilisateurProcessor implements ProcessorInterface
{
    public function __construct(
        private CharteDemandeurRepository $charteDemandeurRepository,
        private MessageBusInterface $messageBus,
    ) {}

    /**
     * @param CharteUtilisateur $data
     */
    #[Override]
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        /**
         * Uniquement prise en charge de PATCH sur la date de validation
         */
        $charte = $this->charteDemandeurRepository->find($data->id);
        $charte->setDateValidation($data->dateValidation);
        $this->charteDemandeurRepository->save($charte, true);

        /**
         * Si tout est validé il y a des choses à faire...on envoie un message
         */
        if (null !== $data->dateValidation) {
            $this->messageBus->dispatch(new CharteValideeMessage($charte));
        }

        return new CharteUtilisateur($charte);
    }
}
