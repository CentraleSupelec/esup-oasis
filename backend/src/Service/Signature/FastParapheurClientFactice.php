<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Service\Signature;

/**
 * Client en mémoire pour le développement et les tests, jamais branché en production.
 * Les méthodes marquer*() déroulent un circuit.
 */
class FastParapheurClientFactice implements FastParapheurClientInterface
{
    /** @var array<string, array{pdf: string, circuitId: string, historique: array<int, array{stateName: string, date: string}>}> */
    private array $documents = [];

    public function estDisponible(): bool
    {
        return true;
    }

    public function deposer(string $pdf, string $circuitId, string $libelle): string
    {
        $documentId = uniqid('fast-factice-', true);

        $this->documents[$documentId] = [
            'pdf' => $pdf,
            'circuitId' => $circuitId,
            'historique' => [
                ['stateName' => 'Envoyé pour signature', 'date' => date('c')],
            ],
        ];

        return $documentId;
    }

    public function consulterHistorique(string $documentId): array
    {
        return $this->documents[$documentId]['historique']
            ?? throw new DocumentFastInconnuException($documentId);
    }

    public function telecharger(string $documentId): string
    {
        $document = $this->documents[$documentId]
            ?? throw new DocumentFastInconnuException($documentId);

        // FAST renvoie le PDF signé (PAdES), ici le document déposé tel quel
        return $document['pdf'];
    }

    /** Signature d'une étape, sans clore le circuit. */
    public function marquerEtapeSignee(string $documentId): void
    {
        $this->ajouterEvenement($documentId, 'Signé');
    }

    /** Dernière signature puis classement, qui marque la fin du circuit. */
    public function marquerCircuitTermine(string $documentId): void
    {
        $this->ajouterEvenement($documentId, 'Signé');
        $this->ajouterEvenement($documentId, 'Classé');
    }

    public function marquerRefuse(string $documentId): void
    {
        $this->ajouterEvenement($documentId, 'Refusé');
    }

    private function ajouterEvenement(string $documentId, string $libelle): void
    {
        if (!isset($this->documents[$documentId])) {
            throw new DocumentFastInconnuException($documentId);
        }

        $this->documents[$documentId]['historique'][] = ['stateName' => $libelle, 'date' => date('c')];
    }
}
