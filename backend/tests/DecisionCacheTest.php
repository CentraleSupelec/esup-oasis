<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Tests;

/**
 * La décision d'aménagements ne doit être stockée par aucun cache.
 *
 * La configuration globale autorise un cache partagé d'une heure, mais aucune purge ne
 * cible l'URI de la décision : après modification d'un aménagement, l'ancienne version
 * et son PDF étaient resservis, sans moyen de forcer la régénération depuis l'interface.
 * La ressource porte de plus des données de santé, qui n'ont pas à séjourner dans un
 * cache intermédiaire ni dans celui du navigateur.
 */
class DecisionCacheTest extends ApiTestCaseCustom
{
    private const string URI = '/utilisateurs/beneficiaire-decision/decisions/2025';

    public function testLaDecisionNEstStockeeParAucunCache(): void
    {
        $entetes = $this->cacheControlPour();

        $this->assertStringContainsString('no-store', $entetes);
        $this->assertStringContainsString('private', $entetes);
    }

    public function testLePdfDeLaDecisionNEstStockeParAucunCache(): void
    {
        // Le PDF est la même ressource sous un autre format, et c'est lui que le cache
        // partagé resservait périmé. Son téléchargement ne passe pas par une navigation,
        // donc aucun rafraîchissement du navigateur ne pouvait le contourner.
        $entetes = $this->cacheControlPour('application/pdf');

        $this->assertStringContainsString('no-store', $entetes);
        $this->assertStringContainsString('private', $entetes);
    }

    public function testAucunCachePartageNEstAnnonceSurLaDecision(): void
    {
        // Garde contre une régression : le s-maxage de la configuration globale ne doit
        // pas réapparaître, sans quoi un cache partagé recommencerait à stocker la
        // ressource. C'est « public: false » qui le neutralise, pas le no-store.
        $this->assertStringNotContainsString('s-maxage', $this->cacheControlPour());
        $this->assertStringNotContainsString('s-maxage', $this->cacheControlPour('application/pdf'));
    }

    private function cacheControlPour(?string $format = null): string
    {
        $client = $this->createClientWithCredentials('gestionnaire');
        $client->request('GET', self::URI, match ($format) {
            null => [],
            default => ['headers' => ['Accept' => $format]],
        });

        $this->assertResponseIsSuccessful();

        return $client->getResponse()->getHeaders()['cache-control'][0] ?? '';
    }
}
