<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260304073757 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX idx_decision_attente_benef_debut_desc');
        $this->addSql('CREATE INDEX IDX_DECISION_AMENAGEMENT_EXAMENS_DEBUT ON decision_amenagement_examens (debut)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX IDX_DECISION_AMENAGEMENT_EXAMENS_DEBUT');
        $this->addSql('CREATE INDEX idx_decision_attente_benef_debut_desc ON decision_amenagement_examens (beneficiaire_id, debut) WHERE ((etat)::text = \'ATTENTE_VALIDATION_CAS\'::text)');
    }
}
