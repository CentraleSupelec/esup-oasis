<?php

namespace App\Service;

use RuntimeException;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Psr\Log\LoggerInterface;

class CasTicketService
{
    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly string $casBaseUrl,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function buildCasLoginUrl(string $serviceUrl): string
    {
        return rtrim($this->casBaseUrl, '/') . '/login?service=' . rawurlencode($serviceUrl);
    }

    public function resolveUidFromServiceTicket(string $ticket, string $serviceUrl): string
    {
        foreach (['/p3/serviceValidate', '/serviceValidate'] as $endpoint) {
            $uid = $this->tryResolveUid($endpoint, $ticket, $serviceUrl);
            if (null !== $uid) {
                return $uid;
            }
        }

        throw new RuntimeException('Echec de validation du ticket CAS');
    }

    private function tryResolveUid(string $endpoint, string $ticket, string $serviceUrl): ?string
    {
        try {
            $response = $this->httpClient->request('GET', rtrim($this->casBaseUrl, '/') . $endpoint, [
                'query' => [
                    'ticket' => $ticket,
                    'service' => $serviceUrl,
                ],
            ]);
            $xmlContent = $response->getContent(false);
            $this->logger->info('CAS Response XML', ['xml' => $xmlContent]);
        } catch (TransportExceptionInterface $e) {
            $this->logger->error('CAS Transport Error', ['error' => $e->getMessage()]);
            return null;
        }

        $xml = @simplexml_load_string($xmlContent);
        if (false === $xml) {
            $this->logger->error('XML Parse Error', ['xml' => $xmlContent]);
            return null;
        }

        $xml->registerXPathNamespace('cas', 'http://www.yale.edu/tp/cas');

        $emailAttrs = [
            'eduPersonPrincipalName',
            'mail',
            'email',
            'userPrincipalName',
        ];

        foreach ($emailAttrs as $attr) {
            $matches = $xml->xpath('//cas:serviceResponse/cas:authenticationSuccess/cas:attributes/cas:' . $attr);
            if (!empty($matches) && !empty((string)$matches[0])) {
                $uid = (string)$matches[0];
                $this->logger->info('Found UID via attribute', ['attr' => $attr, 'uid' => $uid]);
                return $uid;
            }
        }

        $userMatches = $xml->xpath('//cas:serviceResponse/cas:authenticationSuccess/cas:user');
        if (!empty($userMatches) && !empty((string)$userMatches[0])) {
            $uid = (string)$userMatches[0];
            $this->logger->info('Found UID via user tag', ['uid' => $uid]);
            return $uid;
        }

        $this->logger->warning('No UID found in CAS response', ['endpoint' => $endpoint]);
        return null;
    }
}
