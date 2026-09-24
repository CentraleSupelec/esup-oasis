<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Service\Signature;

use LogicException;

/**
 * Client par défaut tant qu'aucun client réel n'est branché : indisponible, les décisions
 * restent envoyées par e-mail même si FAST_CIRCUITS est renseignée.
 */
class FastParapheurClientNonConfigure implements FastParapheurClientInterface
{
    public function estDisponible(): bool
    {
        return false;
    }

    public function deposer(string $pdf, string $circuitId, string $libelle): string
    {
        throw new LogicException('Aucun client FAST-Parapheur n\'est configuré.');
    }

    public function consulterHistorique(string $documentId): array
    {
        throw new LogicException('Aucun client FAST-Parapheur n\'est configuré.');
    }

    public function telecharger(string $documentId): string
    {
        throw new LogicException('Aucun client FAST-Parapheur n\'est configuré.');
    }
}
