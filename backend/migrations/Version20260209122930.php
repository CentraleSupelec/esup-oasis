<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260209122930 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Attache (OWNED BY) les séquences *_id_seq aux colonnes <table>.id pour que TRUNCATE ... RESTART IDENTITY les redémarre.';
    }

    public function up(Schema $schema): void
    {
        // IMPORTANT:
        // - suppose des noms Doctrine/PostgreSQL du style: <table> + séquence <table>_id_seq
        // - fonctionne sur le schéma courant (par défaut "public" via search_path)
        // - ignore sans erreur les cas non conformes (tables/colonnes manquantes, etc.)
        $this->addSql(<<<'SQL'
            DO $$
            DECLARE
              r record;
              v_schema text;
            BEGIN
              -- on prend le "current_schema()" (typiquement public) pour rester simple et éviter les surprises de search_path
              v_schema := current_schema();

              FOR r IN
                SELECT
                  s.sequence_schema,
                  s.sequence_name,
                  regexp_replace(s.sequence_name, '_id_seq$', '') AS table_name
                FROM information_schema.sequences s
                WHERE s.sequence_schema = v_schema
                  AND s.sequence_name LIKE '%\_id\_seq' ESCAPE '\'
              LOOP
                -- table existe ?
                IF EXISTS (
                  SELECT 1
                  FROM information_schema.tables t
                  WHERE t.table_schema = r.sequence_schema
                    AND t.table_name = r.table_name
                    AND t.table_type = 'BASE TABLE'
                )
                -- colonne id existe ?
                AND EXISTS (
                  SELECT 1
                  FROM information_schema.columns c
                  WHERE c.table_schema = r.sequence_schema
                    AND c.table_name = r.table_name
                    AND c.column_name = 'id'
                )
                THEN
                  BEGIN
                    EXECUTE format(
                      'ALTER SEQUENCE %I.%I OWNED BY %I.%I.%I',
                      r.sequence_schema,
                      r.sequence_name,
                      r.sequence_schema,
                      r.table_name,
                      'id'
                    );
                  EXCEPTION
                    WHEN others THEN
                      -- On ne casse pas la migration pour un cas exotique.
                      -- Optionnel: RAISE NOTICE pour debug, mais on reste silencieux.
                      NULL;
                  END;
                END IF;
              END LOOP;
            END $$;
            SQL);
    }

    public function down(Schema $schema): void
    {
        // Revenir en arrière: détacher l'ownership.
        // (PostgreSQL: "OWNED BY NONE")
        $this->addSql(<<<'SQL'
            DO $$
            DECLARE
              r record;
              v_schema text;
            BEGIN
              v_schema := current_schema();

              FOR r IN
                SELECT s.sequence_schema, s.sequence_name
                FROM information_schema.sequences s
                WHERE s.sequence_schema = v_schema
                  AND s.sequence_name LIKE '%\_id\_seq' ESCAPE '\'
              LOOP
                BEGIN
                  EXECUTE format('ALTER SEQUENCE %I.%I OWNED BY NONE', r.sequence_schema, r.sequence_name);
                EXCEPTION
                  WHEN others THEN
                    NULL;
                END;
              END LOOP;
            END $$;
            SQL);
    }
}
