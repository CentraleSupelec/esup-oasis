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

namespace App\Test;

use App\Entity\Utilisateur;
use App\Service\Photo\PhotoIndisponibleException;
use App\Service\Photo\PhotoProviderInterface;
use Override;

class FakePhotoProvider implements PhotoProviderInterface
{
    #[Override]
    public function getPhotoUtilisateur(Utilisateur $utilisateur): string
    {
        if ($utilisateur->getUid() === 'inconnu') {
            throw new PhotoIndisponibleException('Utilisateur inconnu');
        }

        // Return a dummy image content
        return 'dummy_photo_content';
    }
}
