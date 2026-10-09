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
use App\Repository\DecisionAmenagementExamensRepository;

/**
 * Reprend une décision refusée par le parapheur : elle repasse en attente, ses aménagements et avis de
 * santé redeviennent modifiables, puis la demande d'édition dépose un nouveau document.
 */
readonly class RepriseDecisionProcessor implements ProcessorInterface
{
    public function __construct(
        private DecisionAmenagementExamensRepository $decisionAmenagementExamensRepository,
    ) {}

    /**
     * @param DecisionAmenagementExamens $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): DecisionAmenagementExamens
    {
        $entity = $this->decisionAmenagementExamensRepository->find($data->id);
        $entity->setEtat(\App\Entity\DecisionAmenagementExamens::ETAT_ATTENTE_VALIDATION_CAS);
        $this->decisionAmenagementExamensRepository->save($entity, true);

        return new DecisionAmenagementExamens($entity);
    }
}
