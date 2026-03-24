<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260303173250 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(
            'CREATE INDEX IDX_DECISION_BENEFICIAIRE_ETAT ON decision_amenagement_examens (beneficiaire_id, etat)',
        );
        $this->addSql(
            'CREATE INDEX IDX_DECISION_BENEFICIAIRE_DEBUT ON decision_amenagement_examens (beneficiaire_id, debut)',
        );
        $this->addSql('CREATE INDEX IDX_PERIODE_RH_DATE_ENVOI ON periode_rh (date_envoi)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX IDX_DECISION_BENEFICIAIRE_ETAT');
        $this->addSql('DROP INDEX IDX_DECISION_BENEFICIAIRE_DEBUT');
        $this->addSql('DROP INDEX IDX_PERIODE_RH_DATE_ENVOI');
    }
}
