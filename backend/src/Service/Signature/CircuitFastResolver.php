<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Service\Signature;

use App\Entity\DecisionAmenagementExamens;
use JsonException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Circuit FAST de la décision, d'après FAST_CIRCUITS (JSON code composante -> circuit).
 * Null : la décision est envoyée par e-mail.
 */
class CircuitFastResolver
{
    public function __construct(
        #[Autowire('%env(default::FAST_CIRCUITS)%')]
        private readonly ?string $fastCircuits,
        private readonly LoggerInterface $logger,
    ) {}

    public function circuitPour(DecisionAmenagementExamens $decision): ?string
    {
        $mapping = $this->mapping();
        if ([] === $mapping) {
            return null;
        }

        $circuits = [];
        foreach ($decision->getBeneficiaire()->getInscriptionsEnCours() as $inscription) {
            $codeComposante = $inscription->getFormation()?->getComposante()?->getCodeExterne();
            if (null !== $codeComposante && isset($mapping[$codeComposante])) {
                $circuits[$codeComposante] = $mapping[$codeComposante];
            }
        }

        // composante absente du mapping : activation progressive
        if ([] === $circuits) {
            return null;
        }

        // plusieurs circuits possibles : on ne choisit pas le signataire à la place du métier
        if (count(array_unique($circuits)) > 1) {
            $this->logger->warning(
                'Décision {id} : inscriptions en cours dans plusieurs composantes à circuits FAST distincts '
                . '({composantes}), repli sur le comportement historique.',
                [
                    'id' => $decision->getId(),
                    'composantes' => implode(', ', array_keys($circuits)),
                ],
            );

            return null;
        }

        return current($circuits);
    }

    /**
     * @return array<string, string> code composante -> identifiant de circuit
     */
    private function mapping(): array
    {
        if (null === $this->fastCircuits || '' === trim($this->fastCircuits)) {
            return [];
        }

        try {
            $mapping = json_decode($this->fastCircuits, associative: true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $e) {
            // une configuration illisible ne doit pas bloquer l'envoi des décisions
            $this->logger->warning(
                'FAST_CIRCUITS illisible ({erreur}), connecteur de signature désactivé.',
                ['erreur' => $e->getMessage()],
            );

            return [];
        }

        if (!is_array($mapping)) {
            $this->logger->warning('FAST_CIRCUITS doit être un objet JSON, connecteur de signature désactivé.');

            return [];
        }

        return array_filter($mapping, is_string(...));
    }
}
