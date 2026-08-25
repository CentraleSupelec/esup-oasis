<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * ticket interne — administrative profile import.
 * Adds postal address columns on utilisateur as a Doctrine embeddable.
 */
final class Version20260427120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'ticket interne add postal address embeddable to utilisateur';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE utilisateur ADD adresse_ligne1 VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE utilisateur ADD adresse_ligne2 VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE utilisateur ADD adresse_code_postal VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE utilisateur ADD adresse_ville VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE utilisateur ADD adresse_pays VARCHAR(100) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE utilisateur DROP adresse_ligne1');
        $this->addSql('ALTER TABLE utilisateur DROP adresse_ligne2');
        $this->addSql('ALTER TABLE utilisateur DROP adresse_code_postal');
        $this->addSql('ALTER TABLE utilisateur DROP adresse_ville');
        $this->addSql('ALTER TABLE utilisateur DROP adresse_pays');
    }
}
