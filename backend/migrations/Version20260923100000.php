<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ajoute l'option « avis médical requis » sur les profils de bénéficiaire.
 *
 * Désactivée sur tous les profils existants : l'édition des décisions reste
 * possible sans avis médical tant qu'un administrateur ne l'a pas activée.
 */
final class Version20260923100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute profil_beneficiaire.avis_medical_requis (exigence de l\'avis médical pour éditer la décision).';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE profil_beneficiaire ADD avis_medical_requis BOOLEAN DEFAULT false NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE profil_beneficiaire DROP avis_medical_requis');
    }
}
