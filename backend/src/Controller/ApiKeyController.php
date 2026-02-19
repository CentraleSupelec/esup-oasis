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

use App\Security\ClientAppUserProvider;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Finder\Exception\AccessDeniedException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ApiKeyController extends AbstractController
{
    public function __construct(
        private readonly JWTTokenManagerInterface $jwtTokenManager,
    ) {}

    #[Route(path: '/connect/apikey', name: 'apikey_connect', methods: ['POST'])]
    public function getToken(Request $request, ClientAppUserProvider $appUserProvider): Response
    {
        $appId = json_decode($request->getContent())->appId;
        $apiKey = json_decode($request->getContent())->apiKey;

        if (null === $appId) {
            return new Response('Paramètre appId manquant', 400);
        }
        if (null === $apiKey) {
            return new Response('Paramètre apiKey manquant', 400);
        }

        try {
            $user = $appUserProvider->authenticateApp($appId, $apiKey);
        } catch (AccessDeniedException) {
            return new Response('Authentification incorrecte', 401);
        }

        return new Response($this->jwtTokenManager->create($user));
    }
}
