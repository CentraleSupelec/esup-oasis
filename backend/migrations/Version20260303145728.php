<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260303145728 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'CREATE INDEX IDX_BENEFICIAIRE_UTILISATEUR_INTERVALLE ON beneficiaire (utilisateur_id, debut, fin)',
        );
        $this->addSql(
            'CREATE INDEX IDX_DECISION_BENEFICIAIRE_ETAT_DEBUT ON decision_amenagement_examens (beneficiaire_id, etat, debut)',
        );
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX IDX_BENEFICIAIRE_UTILISATEUR_INTERVALLE');
        $this->addSql('DROP INDEX IDX_DECISION_BENEFICIAIRE_ETAT_DEBUT');
        $this->addSql('CREATE INDEX idx_72b433e455caf762 ON decision_amenagement_examens (etat)');
        $this->addSql('CREATE INDEX decision_amenagement_examens_debut_index ON decision_amenagement_examens (debut)');
    }
}
