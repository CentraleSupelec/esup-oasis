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

namespace App\Controller;

use ApiPlatform\Validator\Exception\ValidationException;
use ApiPlatform\Validator\ValidatorInterface;
use App\ApiResource\Telechargement;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\AsController;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[AsController]
class EnvoiPjAction
{
    public function __construct(
        private readonly ValidatorInterface $validator,
    ) {}

    public function __invoke(Request $request): Telechargement
    {
        /**
         * @var UploadedFile $uploadedFile
         */
        $uploadedFile = $request->files->get('file');
        if (!$uploadedFile) {
            throw new BadRequestHttpException('"file" is required');
        }

        $pieceJustificative = new Telechargement();
        $pieceJustificative->file = $uploadedFile;

        // On force la validation ici.
        $violations = $this->validator->validate($pieceJustificative);

        if (null !== $violations && $violations->count() > 0) {
            throw new ValidationException($violations);
        }

        return $pieceJustificative;
    }
}
