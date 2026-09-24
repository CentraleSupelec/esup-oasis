<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Service\Signature;

use RuntimeException;

/**
 * Le documentId demandé n'est pas connu de FAST-Parapheur (ou du client factice).
 */
class DocumentFastInconnuException extends RuntimeException
{
    public function __construct(string $documentId)
    {
        parent::__construct(sprintf('Document FAST inconnu : "%s".', $documentId));
    }
}
