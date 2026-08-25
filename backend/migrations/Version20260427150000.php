<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * OBC-3 — academic profile import.
 *
 * Adds the `code_etape` column on `inscription` to keep the Apogée step
 * code (`cod_etp`) per inscription. This is the building block of the
 * OBC-3 "profil académique" feature: surfacing the cursus on the
 * beneficiary fiche and deriving the LMD level (L1/L2/L3/M1/M2/D1/D3)
 * out of the prefix.
 */
final class Version20260427150000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'OBC-3 add code_etape column to inscription';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE inscription ADD code_etape VARCHAR(20) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE inscription DROP code_etape');
    }
}
