<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ajout d'une colonne `date_avis_medecin` (DATE, nullable) sur la table
 * `decision_amenagement_examens` pour stocker la date de l'avis du médecin
 * désigné par la CDAPH, restituée dynamiquement sur le PAEH.
 */
final class Version20260629100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add nullable date_avis_medecin DATE column on decision_amenagement_examens';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE decision_amenagement_examens ADD date_avis_medecin DATE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE decision_amenagement_examens DROP COLUMN date_avis_medecin');
    }
}
