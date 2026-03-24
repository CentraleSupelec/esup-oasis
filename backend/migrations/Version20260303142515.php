<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260303142515 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE INDEX IDX_BENEFICIAIRE_DATES ON beneficiaire (debut, fin)');
        $this->addSql(
            'CREATE INDEX IDX_DECISION_AMENAGEMENT_EXAMENS_DEBUT_FIN ON decision_amenagement_examens (debut, fin)',
        );
        $this->addSql('CREATE INDEX IDX_DECISION_AMENAGEMENT_EXAMENS_ETAT ON decision_amenagement_examens (etat)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX IDX_BENEFICIAIRE_DATES');
        $this->addSql('DROP INDEX IDX_DECISION_AMENAGEMENT_EXAMENS_DEBUT_FIN');
        $this->addSql('ALTER INDEX idx_decision_amenagement_examens_etat RENAME TO idx_72b433e455caf762');
        $this->addSql('CREATE INDEX idx_evenement_debut_fin ON evenement (debut, fin)');
    }
}
