<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260901140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return "Suivi de la signature électronique FAST-Parapheur des décisions d'aménagements";
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE decision_amenagement_examens ADD etat_signature VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE decision_amenagement_examens ADD fast_document_id VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE decision_amenagement_examens ADD fast_circuit_id VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE decision_amenagement_examens ADD derniere_verification_fast TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE decision_amenagement_examens ADD date_signature TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE decision_amenagement_examens ADD uid_demandeur_signature VARCHAR(255) DEFAULT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_DECISION_FAST_DOCUMENT_ID ON decision_amenagement_examens (fast_document_id)');
        $this->addSql('CREATE INDEX IDX_DECISION_ETAT_SIGNATURE ON decision_amenagement_examens (etat_signature)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IDX_DECISION_ETAT_SIGNATURE');
        $this->addSql('DROP INDEX UNIQ_DECISION_FAST_DOCUMENT_ID');
        $this->addSql('ALTER TABLE decision_amenagement_examens DROP uid_demandeur_signature');
        $this->addSql('ALTER TABLE decision_amenagement_examens DROP date_signature');
        $this->addSql('ALTER TABLE decision_amenagement_examens DROP derniere_verification_fast');
        $this->addSql('ALTER TABLE decision_amenagement_examens DROP fast_circuit_id');
        $this->addSql('ALTER TABLE decision_amenagement_examens DROP fast_document_id');
        $this->addSql('ALTER TABLE decision_amenagement_examens DROP etat_signature');
    }
}
