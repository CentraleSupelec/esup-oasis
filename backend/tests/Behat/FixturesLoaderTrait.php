<?php

namespace App\Tests\Behat;

use Doctrine\Bundle\DoctrineBundle\Registry;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Fidry\AliceDataFixtures\LoaderInterface;

trait FixturesLoaderTrait
{
    protected static LoaderInterface $loader;
    protected static Registry $doctrine;
    protected static string $fixturesPath;

    public function __construct(LoaderInterface $loader, Registry $doctrine, string $fixturesBasePath)
    {
        self::$loader = $loader;
        self::$doctrine = $doctrine;
        self::$fixturesPath = $fixturesBasePath;
    }

    public static function loadFixtures(array $fixtures, $purgeMode = null): void
    {
        $fixtures = array_map(fn($path) => self::$fixturesPath . '/' . $path, $fixtures);
        self::$loader->load($fixtures, purgeMode: $purgeMode);
    }

    static function recreateDatabase(): void
    {
        foreach (self::$doctrine->getManagers() as $manager) {
            if ($manager instanceof EntityManagerInterface) {
                $schemaTool = new SchemaTool($manager);
                $schemaTool->dropDatabase();
                $schemaTool->createSchema($manager->getMetadataFactory()->getAllMetadata());
                $manager->clear();
            }
        }
    }
}
