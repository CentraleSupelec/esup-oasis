<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Controller\MediaDownloadController;
use App\Entity\Fichier;
use App\Repository\FichierRepository;
use App\Service\FileStorage\StorageProviderInterface;
use PHPUnit\Framework\TestCase;
use Psr\Container\ContainerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

/**
 * Les fichiers servis par cette route sont des pièces justificatives et des décisions
 * d'aménagements : ils portent des données de santé. Aucun cache partagé ne doit en
 * conserver de copie, et celle du navigateur doit être revalidée avant chaque usage.
 */
class MediaDownloadCacheTest extends TestCase
{
    public function testLeFichierResteHorsDesCachesPartages(): void
    {
        $cacheControl = $this->telecharger()->headers->get('Cache-Control') ?? '';

        self::assertStringContainsString('private', $cacheControl);
    }

    public function testLaCopieDuNavigateurEstRevalidee(): void
    {
        // Sans revalidation, un document modifié pourrait être resservi depuis le poste.
        $cacheControl = $this->telecharger()->headers->get('Cache-Control') ?? '';

        self::assertStringContainsString('no-cache', $cacheControl);
    }

    public function testAucunCachePartageNEstAnnonce(): void
    {
        // Garde contre une régression : ni durée de vie partagée, ni mention « public »
        // ne doivent apparaître, y compris si un en-tête de validation est ajouté plus
        // tard sur cette route.
        $cacheControl = $this->telecharger()->headers->get('Cache-Control') ?? '';

        self::assertStringNotContainsString('s-maxage', $cacheControl);
        self::assertStringNotContainsString('public', $cacheControl);
    }

    private function telecharger(): \Symfony\Component\HttpFoundation\Response
    {
        $fichier = $this->createMock(Fichier::class);
        $fichier->method('getId')->willReturn(1);
        $fichier->method('getNom')->willReturn('decision.pdf');
        $fichier->method('getTypeMime')->willReturn('application/pdf');
        $fichier->method('getMetadata')->willReturn(['chemin' => 'decision.pdf']);

        $depot = $this->createMock(FichierRepository::class);
        $depot->method('find')->willReturn($fichier);

        $stockage = $this->createMock(StorageProviderInterface::class);
        $stockage->method('get')->willReturn('%PDF-1.4 contenu');

        $autorisation = $this->createMock(AuthorizationCheckerInterface::class);
        $autorisation->method('isGranted')->willReturn(true);

        $conteneur = $this->createMock(ContainerInterface::class);
        $conteneur->method('has')->willReturn(true);
        $conteneur->method('get')->willReturn($autorisation);

        $controleur = new MediaDownloadController();
        $controleur->setContainer($conteneur);

        return $controleur->getFile(1, $depot, $stockage);
    }
}
