<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

declare(strict_types=1);

namespace App\Tests\Controller;

use App\Service\CasTicketService;
use App\Tests\ApiTestCaseCustom;

/**
 * Le domaine du cookie JWT est configurable (JWT_COOKIE_DOMAIN). Posé tel quel sur un hôte
 * qu'il ne couvre pas, le cookie est rejeté par le navigateur et l'utilisateur reçoit un 401
 * sans trace exploitable. Ce test verrouille le repli sur un cookie limité à l'hôte appelé.
 */
final class OAuthCookieDomaineTest extends ApiTestCaseCustom
{
    private const UID_EXISTANT = 'admin';
    private const HOTE_NON_COUVERT = 'hote-hors-perimetre.test';

    public function testLeCookieJwtEstLimiteALHoteQuandLeDomaineConfigureNeLeCouvrePas(): void
    {
        $cookies = $this->authentifierParTicketCas('http://' . self::HOTE_NON_COUVERT);

        self::assertResponseIsSuccessful();
        self::assertStringContainsString('oasis-token=', $cookies);
        self::assertStringNotContainsStringIgnoringCase(
            'domain=',
            $cookies,
            'Le domaine configuré ne couvre pas l\'hôte appelé : le cookie doit être posé sans domaine.',
        );
    }

    public function testLeCookieJwtConserveLeDomaineQuandIlCouvreLHote(): void
    {
        $domaineConfigure = (string) ($_ENV['JWT_COOKIE_DOMAIN'] ?? '');

        if ($domaineConfigure === '') {
            self::markTestSkipped('Aucun domaine de cookie configuré dans cet environnement.');
        }

        $cookies = $this->authentifierParTicketCas('http://' . ltrim($domaineConfigure, '.'));

        self::assertResponseIsSuccessful();
        self::assertStringContainsStringIgnoringCase('domain=' . ltrim($domaineConfigure, '.'), $cookies);
    }

    private function authentifierParTicketCas(string $origine): string
    {
        $client = static::createClient();

        $cas = $this->createMock(CasTicketService::class);
        $cas->method('resolveUidFromServiceTicket')->willReturn(self::UID_EXISTANT);
        static::getContainer()->set(CasTicketService::class, $cas);

        $client->request('POST', $origine . '/connect/oauth/token?json=1', [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => json_encode([
                'accessToken' => 'ST-ticket-de-test',
                'state' => 'etat',
                'redirectUri' => $origine . '/',
            ], JSON_THROW_ON_ERROR),
        ]);

        return implode(' ', $client->getResponse()->getHeaders()['set-cookie'] ?? []);
    }
}
