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

namespace App\Message;

use Exception;

class ErreurTechniqueMessage
{
    private array $trace;
    private string $exceptionMessage;

    public function __construct(
        Exception $exception,
        private readonly string $message,
    ) {
        $this->trace = array_map(fn(array $ligne) => array_filter(
            $ligne,
            fn($key) => $key !== 'args',
            ARRAY_FILTER_USE_KEY,
        ), $exception->getTrace());
        $this->exceptionMessage = $exception->getMessage();
    }

    public function getExceptionMessage(): string
    {
        return $this->exceptionMessage;
    }

    public function getMessage(): string
    {
        return $this->message;
    }

    /**
     * @return string[]
     */
    public function getTrace(): array
    {
        return $this->trace;
    }
}
