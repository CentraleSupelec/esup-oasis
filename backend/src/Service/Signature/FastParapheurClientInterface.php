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
 * Client FAST-Parapheur (Docaposte). Le circuit (signataires, étapes, relances) est porté
 * par FAST : OASIS dépose le PDF, suit son historique et récupère le document signé.
 */
interface FastParapheurClientInterface
{
    /** Faux pour un client non configuré : les décisions restent envoyées par e-mail. */
    public function estDisponible(): bool;

    /**
     * @param string $libelle libellé affiché aux signataires
     *
     * @return string identifiant du document côté FAST
     */
    public function deposer(string $pdf, string $circuitId, string $libelle): string;

    /**
     * @return array<int, array{stateName: string, date: string}> historique brut, dans l'ordre chronologique
     */
    public function consulterHistorique(string $documentId): array;

    /**
     * @return string contenu du PDF signé
     */
    public function telecharger(string $documentId): string;
}
