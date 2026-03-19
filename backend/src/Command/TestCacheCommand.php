<?php

namespace App\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Contracts\Cache\CacheInterface;

#[AsCommand(name: 'app:test-cache', description: 'anonymisation des données')]
class TestCacheCommand extends Command
{
    public function __construct(
        private readonly CacheInterface $cache,
        ?string $name = null,
    ) {
        parent::__construct($name);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->cache->get('test', fn() => 'default value');
        return Command::SUCCESS;
    }
}
