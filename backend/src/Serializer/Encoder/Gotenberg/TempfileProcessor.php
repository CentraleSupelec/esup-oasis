<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Serializer\Encoder\Gotenberg;

use Generator;
use Sensiolabs\GotenbergBundle\Exception\ProcessorException;
use Sensiolabs\GotenbergBundle\Processor\ProcessorInterface;

/**
 * @implements ProcessorInterface<resource>
 */
final class TempfileProcessor implements ProcessorInterface
{
    public function __invoke(?string $fileName): Generator
    {
        $resource = tmpfile() ?: throw new ProcessorException('Unable to create a temporary file resource.');

        do {
            $chunk = yield;
            if (false === fwrite($resource, $chunk->getContent())) {
                throw new ProcessorException('Unable to write to the temporary file resource.');
            }
        } while (!$chunk->isLast());

        rewind($resource);

        return $resource;
    }
}
