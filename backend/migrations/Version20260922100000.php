<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ajoute sur l'inscription les données de scolarité exposées sur la fiche
 * bénéficiaire : cursus d'inscription, cursus aménagé, niveau d'études et
 * redoublement.
 *
 * Toutes les colonnes sont nullables et laissées vides tant qu'aucun connecteur
 * de SI scolarité ne les renseigne : une instance qui ne personnalise rien
 * conserve exactement son affichage.
 *
 * Le niveau et le redoublement sont stockés tels que fournis par le connecteur,
 * et non recalculés à la lecture : les règles de correspondance (codes type de
 * diplôme, interprétation du compteur d'inscriptions) dépendent du paramétrage
 * de l'établissement et vivent donc dans son connecteur.
 */
final class Version20260922100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute les données de scolarité sur inscription (étape, cursus aménagé, niveau, redoublement).';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE inscription ADD code_etape VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE inscription ADD code_cursus_amenage VARCHAR(10) DEFAULT NULL');
        $this->addSql('ALTER TABLE inscription ADD libelle_cursus_amenage VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE inscription ADD niveau VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE inscription ADD redoublant BOOLEAN DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE inscription DROP code_etape');
        $this->addSql('ALTER TABLE inscription DROP code_cursus_amenage');
        $this->addSql('ALTER TABLE inscription DROP libelle_cursus_amenage');
        $this->addSql('ALTER TABLE inscription DROP niveau');
        $this->addSql('ALTER TABLE inscription DROP redoublant');
    }
}
