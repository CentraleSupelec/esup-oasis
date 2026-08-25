<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * ticket interne — redoublement et cursus aménagé.
 *
 * Ajoute trois colonnes sur `inscription` pour porter les données
 * Apogée nécessaires aux critères #3 (redoublement) et #5 (cursus
 * aménagé) :
 *   - `nombre_inscriptions_etape` : compteur natif Apogée
 *     (`nbr_ins_etp`) du nombre d'inscriptions administratives à
 *     l'étape, base officielle (l’équipe OASIS 23/06/2026) du calcul
 *     du redoublement (> 1 ⇒ redoublant) en remplacement de la
 *     comparaison `cod_etp` invalidée le 28/05/2026.
 *   - `code_cursus_amenage` / `libelle_cursus_amenage` : code et
 *     libellé du cursus aménagé SISE (`cod_sis_cur_amg` /
 *     `lib_cur_amg`), qui sert à la fois de garde du calcul
 *     redoublement et d'information affichée sur la fiche.
 */
final class Version20260630130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'ticket interne add nombre_inscriptions_etape, code_cursus_amenage and libelle_cursus_amenage columns to inscription';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE inscription ADD nombre_inscriptions_etape INT DEFAULT NULL');
        $this->addSql('ALTER TABLE inscription ADD code_cursus_amenage VARCHAR(10) DEFAULT NULL');
        $this->addSql('ALTER TABLE inscription ADD libelle_cursus_amenage VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE inscription DROP nombre_inscriptions_etape');
        $this->addSql('ALTER TABLE inscription DROP code_cursus_amenage');
        $this->addSql('ALTER TABLE inscription DROP libelle_cursus_amenage');
    }
}
