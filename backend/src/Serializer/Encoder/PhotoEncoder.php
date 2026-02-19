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

namespace App\Serializer\Encoder;

use Override;
use Symfony\Component\Serializer\Encoder\EncoderInterface;

class PhotoEncoder implements EncoderInterface
{
    #[Override]
    public function encode(mixed $data, string $format, array $context = []): string
    {
        return current($data);
    }

    #[Override]
    public function supportsEncoding(string $format): bool
    {
        return 'jpeg' === $format;
    }
}
