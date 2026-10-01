<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\State\DecisionAmenagementExamens;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\DecisionAmenagementExamens;
use App\ApiResource\Utilisateur;
use App\Message\RessourceModifieeMessage;
use App\Repository\DecisionAmenagementExamensRepository;
use App\Service\Signature\SuiviSignatureService;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;
use Symfony\Component\Messenger\MessageBusInterface;

/**
 * Vérifie auprès du parapheur une décision en signature, à la demande du gestionnaire, comme le
 * ferait le passage planifié du suivi.
 */
readonly class VerificationSignatureProcessor implements ProcessorInterface
{
    public function __construct(
        private DecisionAmenagementExamensRepository $decisionAmenagementExamensRepository,
        private SuiviSignatureService $suiviSignatureService,
        private MessageBusInterface $messageBus,
    ) {}

    /**
     * @param DecisionAmenagementExamens $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): DecisionAmenagementExamens
    {
        $entity = $this->decisionAmenagementExamensRepository->find($data->id);

        if (!$this->suiviSignatureService->verifier($entity)) {
            throw new ServiceUnavailableHttpException(
                null,
                'Le parapheur électronique n\'a pas pu être interrogé : l\'état sera mis à jour au prochain passage du suivi.',
            );
        }

        // même sans changement d'état, la fiche affiche l'heure de cette vérification
        $this->messageBus->dispatch(new RessourceModifieeMessage(new Utilisateur($entity->getBeneficiaire())));

        return new DecisionAmenagementExamens($entity);
    }
}
