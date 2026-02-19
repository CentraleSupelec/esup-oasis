<?php

namespace App\Tests\Behat;

use App\Entity\ApplicationCliente;
use App\Entity\Utilisateur;
use Behat\Behat\Context\Context;
use Behat\Behat\Context\Environment\InitializedContextEnvironment;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Behat\Hook\BeforeScenario;
use Behat\Step\Given;
use Behatch\Context\RestContext;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Persistence\ObjectManager;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

class AuthenticationContext implements Context
{
    private JWTTokenManagerInterface $JWTTokenManager;
    private string $token;
    private RestContext $restContext;
    private ObjectManager $manager;

    public function __construct(ManagerRegistry $doctrine, JWTTokenManagerInterface $tokenManager)
    {
        $this->manager = $doctrine->getManager();
        $this->JWTTokenManager = $tokenManager;
    }

    #[Given('(I) send an authentication token for :uid')]
    #[Given("(j')envoie un token d'authentification pour :uid")]
    public function iSendAnAuthTokenFor(string $uid): void
    {
        $user = $this->manager
            ->getRepository(Utilisateur::class)
            ->findOneBy([
                'uid' => $uid,
            ]);
        $this->token = $this->JWTTokenManager->create($user);
        $this->restContext->iAddHeaderEqualTo('Authorization', 'Bearer ' . $this->token);
    }

    #[Given("(j')envoie un token d'authentification pour l'application :appId")]
    #[Given('I send an authentication token for application :appId')]
    public function iSendAnAuthTokenForApp(string $appId): void
    {
        $user = $this->manager
            ->getRepository(ApplicationCliente::class)
            ->findOneBy([
                'identifiant' => $appId,
            ]);
        $this->token = $this->JWTTokenManager->create($user);
        $this->restContext->iAddHeaderEqualTo('Authorization', 'Bearer ' . $this->token);
    }

    #[Given('(I) send no authentication token')]
    public function iSendEmptyAuthHeader(): void
    {
        $this->restContext->iAddHeaderEqualTo('Authorization', '');
    }

    /**
     * Gives access to the Behatch context - needed to force auth header
     */
    #[BeforeScenario]
    public function gatherContexts(BeforeScenarioScope $scope): void
    {
        /**
         * @var InitializedContextEnvironment $environment
         */
        $environment = $scope->getEnvironment();
        /**
         * @var RestContext $restContext
         */
        $restContext = $environment->getContext(RestContext::class);
        $this->restContext = $restContext;
    }
}
