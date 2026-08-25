<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * OBC-1 critère 2 — situation sociale Apogée.
 * Adds the social-situation code/label columns on utilisateur, fed from
 * Apogée (cod_soc / lib_soc) and projected from the most recent inscription.
 */
final class Version20260630120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'OBC-1 add situation sociale (code/libelle) columns to utilisateur';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE utilisateur ADD code_situation_sociale VARCHAR(10) DEFAULT NULL');
        $this->addSql('ALTER TABLE utilisateur ADD libelle_situation_sociale VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE utilisateur DROP code_situation_sociale');
        $this->addSql('ALTER TABLE utilisateur DROP libelle_situation_sociale');
    }
}
