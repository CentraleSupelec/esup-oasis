<?php

namespace App\Tests;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use ApiPlatform\Symfony\Bundle\Test\Client;
use App\Entity\ApplicationCliente;
use App\Entity\Demande;
use App\Entity\Reponse;
use App\Entity\Utilisateur;
use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\Persistence\ManagerRegistry;
use Exception;
use Fidry\AliceDataFixtures\Loader\PurgerLoader;
use Fidry\AliceDataFixtures\Persistence\PurgeMode;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use RuntimeException;
use Symfony\Component\Clock\Clock;

abstract class ApiTestCaseCustom extends ApiTestCase
{
    protected static ?bool $alwaysBootKernel = true;

    private static bool $databaseInitialized = false;

    protected function createClientWithCredentials(string $uid = 'admin'): Client
    {
        $token = $this->getTokenForUser($uid);

        return $this->createClientWithToken($token);
    }

    protected function createClientWithAppCredentials(string $appId = 'someapp'): Client
    {
        $token = $this->getTokenForApp($appId);

        return $this->createClientWithToken($token);
    }

    private function createClientWithToken(string $token): Client
    {
        return static::createClient([], [
            'headers' => [
                'Authorization' => 'Bearer ' . $token,
                'Content-Type' => 'application/ld+json',
                'Accept' => 'application/ld+json',
            ],
        ]);
    }

    protected function getTokenForUser(string $uid): string
    {
        $container = static::getContainer();
        $manager = $container->get('doctrine')->getManager();
        $user = $manager->getRepository(Utilisateur::class)->findOneBy(['uid' => $uid]);

        if (!$user) {
            throw new RuntimeException("Utilisateur $uid non trouvé pour le test.");
        }

        /** @var JWTTokenManagerInterface $tokenManager */
        $tokenManager = $container->get(JWTTokenManagerInterface::class);
        return $tokenManager->create($user);
    }

    protected function getTokenForApp(string $appId): string
    {
        $container = static::getContainer();
        $manager = $container->get('doctrine')->getManager();
        $app = $manager->getRepository(ApplicationCliente::class)->findOneBy(['identifiant' => $appId]);

        if (!$app) {
            throw new RuntimeException("Application $appId non trouvée pour le test.");
        }

        /** @var JWTTokenManagerInterface $tokenManager */
        $tokenManager = $container->get(JWTTokenManagerInterface::class);
        return $tokenManager->create($app);
    }

    public static function setUpBeforeClass(): void
    {
        parent::setUpBeforeClass();

        if (self::$databaseInitialized) {
            return;
        }

        static::ensureKernelShutdown();
        static::bootKernel();

        $container = static::getContainer();

        /** @var EntityManagerInterface $em */
        $em = $container->get(EntityManagerInterface::class);

        /** @var PurgerLoader $loader */
        $loader = $container->get('fidry_alice_data_fixtures.loader.doctrine');

        $connection = $em->getConnection();
        $platform = $connection->getDatabasePlatform();

        if (!$platform instanceof PostgreSQLPlatform) {
            throw new RuntimeException('Tests attendus sur PostgreSQL uniquement (APP_ENV=test).');
        }

        $schemaManager = $connection->createSchemaManager();
        $tableNames = array_map(static fn($t) => $t->getObjectName()->toString(), $schemaManager->listTables());

        if ($tableNames !== []) {
            $quoted = array_map(static fn(string $t) => $platform->quoteSingleIdentifier($t), $tableNames);
            $connection->executeStatement('TRUNCATE ' . implode(', ', $quoted) . ' RESTART IDENTITY CASCADE');
        }

        $em->clear();

        $fixtures = [
            __DIR__ . '/../fixtures/tests/applications_clientes.yaml',
            __DIR__ . '/../fixtures/tests/amenagements.yaml',
            __DIR__ . '/../fixtures/tests/avis_ese.yaml',
            __DIR__ . '/../fixtures/tests/beneficiaires.yaml',
            __DIR__ . '/../fixtures/tests/campagnes.yaml',
            __DIR__ . '/../fixtures/tests/campagnes_demandes.yaml',
            __DIR__ . '/../fixtures/tests/campus.yaml',
            __DIR__ . '/../fixtures/tests/categories_amenagements.yaml',
            __DIR__ . '/../fixtures/tests/chartes.yaml',
            __DIR__ . '/../fixtures/tests/chartes_demandeurs.yaml',
            __DIR__ . '/../fixtures/tests/clubs_sportifs.yaml',
            __DIR__ . '/../fixtures/tests/commissions.yaml',
            __DIR__ . '/../fixtures/tests/competences.yaml',
            __DIR__ . '/../fixtures/tests/composantes.yaml',
            __DIR__ . '/../fixtures/tests/demandes.yaml',
            __DIR__ . '/../fixtures/tests/decisions.yaml',
            __DIR__ . '/../fixtures/tests/etapes_demandes.yaml',
            __DIR__ . '/../fixtures/tests/etats_demandes.yaml',
            __DIR__ . '/../fixtures/tests/evenements.yaml',
            __DIR__ . '/../fixtures/tests/formations.yaml',
            __DIR__ . '/../fixtures/tests/inscriptions.yaml',
            __DIR__ . '/../fixtures/tests/intervenants.yaml',
            __DIR__ . '/../fixtures/tests/interventions_forfait.yaml',
            __DIR__ . '/../fixtures/tests/membres_commissions.yaml',
            __DIR__ . '/../fixtures/tests/options_reponses.yaml',
            __DIR__ . '/../fixtures/tests/parametres.yaml',
            __DIR__ . '/../fixtures/tests/periodes_rh.yaml',
            __DIR__ . '/../fixtures/tests/profils_beneficiaires.yaml',
            __DIR__ . '/../fixtures/tests/questions.yaml',
            __DIR__ . '/../fixtures/tests/questions_etapes_demandes.yaml',
            __DIR__ . '/../fixtures/tests/services.yaml',
            __DIR__ . '/../fixtures/tests/sportifs_haut_niveau.yaml',
            __DIR__ . '/../fixtures/tests/tags.yaml',
            __DIR__ . '/../fixtures/tests/taux_horaires.yaml',
            __DIR__ . '/../fixtures/tests/types_amenagements.yaml',
            __DIR__ . '/../fixtures/tests/types_demandes.yaml',
            __DIR__ . '/../fixtures/tests/types_equipements.yaml',
            __DIR__ . '/../fixtures/tests/types_evenements.yaml',
            __DIR__ . '/../fixtures/tests/typologies.yaml',
            __DIR__ . '/../fixtures/tests/utilisateurs.yaml',
            __DIR__ . '/../fixtures/tests/utilisateurs_devs.yaml',
            __DIR__ . '/../fixtures/tests/valeurs_parametres.yaml',
            __DIR__ . '/../fixtures/tests/reponses.yaml',
            __DIR__ . '/../fixtures/tests/decisions.yaml',
            __DIR__ . '/../fixtures/tests/chartes_demandeurs.yaml',
        ];

        $loader->load($fixtures, purgeMode: PurgeMode::createNoPurgeMode());

        self::$databaseInitialized = true;
    }

    protected function setUp(): void
    {
        parent::setUp();

        static::ensureKernelShutdown();
        static::createClient();

        /** @var EntityManagerInterface $em */
        $em = static::getContainer()->get(EntityManagerInterface::class);

        // Isolation rapide : 1 transaction par test
        $em->getConnection()->beginTransaction();
    }

    protected function tearDown(): void
    {
        /** @var EntityManagerInterface $em */
        $em = static::getContainer()->get(EntityManagerInterface::class);

        $connection = $em->getConnection();

        // Si le test a échoué au milieu, on veut quand même revenir à l’état initial
        if ($connection->isTransactionActive()) {
            $connection->rollBack();
        }

        $em->clear();

        parent::tearDown();
    }
}
