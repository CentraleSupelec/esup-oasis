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

use App\Entity\Fichier;
use App\Repository\FichierRepository;
use App\Service\FileStorage\StorageProviderInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileNotFoundException;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class MediaDownloadController extends AbstractController
{
    #[Route('/fichiers/{fileId}', name: 'fichiers_download', methods: ['GET'])]
    public function getFile(
        int $fileId,
        FichierRepository $fichierRepository,
        StorageProviderInterface $storageProvider,
    ): Response {
        $fichier = $fichierRepository->find($fileId);
        if (null === $fichier) {
            throw new FileNotFoundException('/fichiers/' . $fileId);
        }

        $this->denyAccessUnlessGranted(Fichier::VOIR_FICHIER, $fichier);

        $file = $storageProvider->get($fichier->getMetadata());
        if ($file instanceof File) {
            $file = $file->getContent();
        }
        $response = new Response($file);
        $disposition = HeaderUtils::makeDisposition(
            disposition: HeaderUtils::DISPOSITION_INLINE,
            filename: $fichier->getNom(),
            filenameFallback: $fichier->getId(),
        );
        $response->headers->set('Content-Disposition', $disposition);
        $response->headers->set('Content-Type', $fichier->getTypeMime());
        // Les fichiers servis ici sont des pièces justificatives et des décisions
        // d'aménagements : ils portent des données de santé, qui n'ont pas à séjourner
        // dans un cache partagé entre utilisateurs. Le navigateur peut en conserver une
        // copie, mais doit la revalider avant chaque réutilisation.
        //
        // C'est le comportement que Symfony appliquait déjà faute d'instruction ; on
        // l'écrit pour qu'il ne dépende plus d'un défaut du framework, ni ne bascule le
        // jour où un en-tête de validation serait ajouté sur cette route.
        $response->headers->set('Cache-Control', 'private, no-cache');

        return $response;
    }
}
