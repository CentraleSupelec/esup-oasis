<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ajout d'une colonne `observations` (texte libre, nullable) sur la table
 * `decision_amenagement_examens` afin de permettre au gestionnaire de saisir
 * des observations particulières restituées sur le PAEH.
 */
final class Version20260625120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add nullable observations TEXT column on decision_amenagement_examens';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE decision_amenagement_examens ADD observations TEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE decision_amenagement_examens DROP COLUMN observations');
    }
}
