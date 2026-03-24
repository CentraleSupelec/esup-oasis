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

namespace App\Service;

use League\OAuth2\Client\Provider\Exception\IdentityProviderException;
use League\OAuth2\Client\Provider\GenericProvider;
use League\OAuth2\Client\Provider\ResourceOwnerInterface;
use League\OAuth2\Client\Token\AccessToken;
use Lexik\Bundle\JWTAuthenticationBundle\Exception\ExpiredTokenException;
use RuntimeException;
use UnexpectedValueException;

class OAuthService
{
    private array $options;

    function __construct(
        $clientId,
        $clientSecret,
        $redirectUri,
        $urlAuthorize,
        $urlAccessToken,
        $urlResourceOwnerDetails,
    ) {
        $this->options = [
            'clientId' => $clientId,
            'clientSecret' => $clientSecret,
            'redirectUri' => $redirectUri,
            'urlAuthorize' => $urlAuthorize,
            'urlAccessToken' => $urlAccessToken,
            'urlResourceOwnerDetails' => $urlResourceOwnerDetails,
        ];
    }

    /**
     * @param array $options
     * @return GenericProvider
     */
    private function getProvider(array $options): GenericProvider
    {
        return new GenericProvider($options);
    }

    /**
     * @param null $redirectUrl
     * @return string
     * @throws IdentityProviderException
     */
    public function getAccessToken($redirectUrl = null): string
    {
        if (null !== $redirectUrl) {
            $this->options['redirectUri'] = $redirectUrl;
        }

        $provider = $this->getProvider($this->options);

        if (null === ($_GET['code'] ?? null)) {
            $authorizationUrl = $provider->getAuthorizationUrl();

            // Redirect the user to the authorization URL.
            header('Location: ' . $authorizationUrl);
            exit();
        } elseif (empty($_GET['state'])) {
            exit('Invalid state');
        } else {
            try {
                // Try to get an access token using the authorization code grant.
                $accessToken = $provider->getAccessToken('authorization_code', [
                    'code' => $_GET['code'],
                ]);
                $accessToken->getExpires();
                return $accessToken->getToken();
            } catch (IdentityProviderException|UnexpectedValueException $e) {
                // Failed to get the access token or user details.
                throw $e;
            }
        }
    }

    /**
     * @param string $accessToken
     * @return ResourceOwnerInterface
     */
    public function getResourceOwnerFromToken(string $accessToken): ResourceOwnerInterface
    {
        $accessToken = new AccessToken(['access_token' => $accessToken]);

        try {
            if ($accessToken->hasExpired()) {
                //try to refresh it
                try {
                    $newAccessToken = $this->getProvider($this->options)->getAccessToken('refresh_token', [
                        'refresh_token' => $accessToken->getRefreshToken(),
                    ]);
                    $accessToken = $newAccessToken;
                } catch (IdentityProviderException) {
                    throw new ExpiredTokenException('OAuth AccessToken has expired and couldnt be refreshed');
                }
            }
        } catch (RuntimeException) {
            //À voir :un moyen de vérifier ça...quel impact sur l'appel suivant si c'est expiré?
        }

        return $this->getProvider($this->options)->getResourceOwner($accessToken);
    }
}
