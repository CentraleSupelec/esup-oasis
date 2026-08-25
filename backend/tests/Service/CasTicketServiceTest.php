<?php

declare(strict_types=1);

namespace App\Tests\Service;

use App\Service\CasTicketService;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use RuntimeException;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Contracts\HttpClient\ResponseInterface;

/**
 * Couvre le pont CAS "service ticket" (démo Saclay) : construction de l'URL de
 * login et résolution de l'uid depuis la réponse XML de /serviceValidate.
 */
final class CasTicketServiceTest extends TestCase
{
    private const CAS_BASE = 'https://sso.example.fr/cas';

    private static function successXml(string $attributes, string $user = 'jdupont'): string
    {
        return <<<XML
            <cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
                <cas:authenticationSuccess>
                    <cas:user>$user</cas:user>
                    <cas:attributes>
                        $attributes
                    </cas:attributes>
                </cas:authenticationSuccess>
            </cas:serviceResponse>
            XML;
    }

    private const FAILURE_XML = <<<XML
        <cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
            <cas:authenticationFailure code='INVALID_TICKET'>ticket inconnu</cas:authenticationFailure>
        </cas:serviceResponse>
        XML;

    private function service(callable|array $responses): CasTicketService
    {
        $client = new MockHttpClient($responses, self::CAS_BASE);

        return new CasTicketService($client, self::CAS_BASE, new NullLogger());
    }

    public function testBuildCasLoginUrlEncodesTheService(): void
    {
        $service = $this->service([]);
        $url = $service->buildCasLoginUrl('http://localhost:8101/connect/oauth/cas/accessToken?state=abc');

        self::assertSame(
            self::CAS_BASE . '/login?service=http%3A%2F%2Flocalhost%3A8101%2Fconnect%2Foauth%2Fcas%2FaccessToken%3Fstate%3Dabc',
            $url,
        );
    }

    public function testBuildCasLoginUrlTrimsTrailingSlashOnBase(): void
    {
        $client = new MockHttpClient([]);
        $service = new CasTicketService($client, self::CAS_BASE . '/', new NullLogger());

        self::assertStringStartsWith(self::CAS_BASE . '/login?service=', $service->buildCasLoginUrl('http://svc'));
    }

    public function testResolveUidPrefersEduPersonPrincipalName(): void
    {
        // mail ET eduPersonPrincipalName présents : c'est bien eppn qui doit primer.
        $xml = self::successXml(
            "<cas:mail>autre@example.fr</cas:mail>\n<cas:eduPersonPrincipalName>jdupont@example.fr</cas:eduPersonPrincipalName>",
        );
        $service = $this->service([new MockResponse($xml)]);

        self::assertSame('jdupont@example.fr', $service->resolveUidFromServiceTicket('ST-1', 'http://svc'));
    }

    public function testResolveUidFallsBackToMailWhenNoEppn(): void
    {
        $xml = self::successXml('<cas:mail>jdupont@example.fr</cas:mail>');
        $service = $this->service([new MockResponse($xml)]);

        self::assertSame('jdupont@example.fr', $service->resolveUidFromServiceTicket('ST-1', 'http://svc'));
    }

    public function testResolveUidFallsBackToUserTagWhenNoAttribute(): void
    {
        $xml = self::successXml('', 'jdupont');
        $service = $this->service([new MockResponse($xml)]);

        self::assertSame('jdupont', $service->resolveUidFromServiceTicket('ST-1', 'http://svc'));
    }

    public function testResolveUidRetriesSecondEndpointWhenFirstHasNoUid(): void
    {
        // /p3/serviceValidate répond un échec (pas d'uid), /serviceValidate réussit.
        $service = $this->service([
            new MockResponse(self::FAILURE_XML),
            new MockResponse(self::successXml('<cas:eduPersonPrincipalName>jdupont@example.fr</cas:eduPersonPrincipalName>')),
        ]);

        self::assertSame('jdupont@example.fr', $service->resolveUidFromServiceTicket('ST-1', 'http://svc'));
    }

    public function testResolveUidQueriesP3EndpointFirstWithTicketAndService(): void
    {
        $captured = [];
        $service = $this->service(function (string $method, string $url) use (&$captured): ResponseInterface {
            $captured[] = $url;

            return new MockResponse(self::successXml('<cas:eduPersonPrincipalName>jdupont@example.fr</cas:eduPersonPrincipalName>'));
        });

        $service->resolveUidFromServiceTicket('ST-42', 'http://localhost:8101/callback');

        self::assertStringContainsString(self::CAS_BASE . '/p3/serviceValidate', $captured[0]);
        self::assertStringContainsString('ticket=ST-42', $captured[0]);
        // Le ticket doit être validé pour EXACTEMENT le service qui l'a obtenu.
        self::assertStringContainsString('service=', $captured[0]);
        self::assertStringContainsString('localhost:8101/callback', $captured[0]);
    }

    public function testResolveUidThrowsWhenAllEndpointsFail(): void
    {
        $service = $this->service([
            new MockResponse(self::FAILURE_XML),
            new MockResponse(self::FAILURE_XML),
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Echec de validation du ticket CAS');
        $service->resolveUidFromServiceTicket('ST-1', 'http://svc');
    }

    public function testResolveUidThrowsOnMalformedXml(): void
    {
        $service = $this->service([
            new MockResponse('<not-xml'),
            new MockResponse('<not-xml'),
        ]);

        $this->expectException(RuntimeException::class);
        $service->resolveUidFromServiceTicket('ST-1', 'http://svc');
    }
}
