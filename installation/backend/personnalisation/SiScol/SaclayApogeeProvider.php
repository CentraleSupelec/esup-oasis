<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Service\SiScol;

/**
 * Connecteur Apogée de l'université Paris-Saclay.
 *
 * Reprend tout le comportement du connecteur Apogée du cœur et n'y ajoute que
 * la dérivation du niveau d'études et du redoublement, à partir des colonnes
 * supplémentaires exposées par la requête d'inscriptions locale
 * (personnalisation/config/apogee/apogee_get_inscriptions.sql).
 *
 * Ces règles restent ici plutôt que dans le cœur parce qu'elles reposent sur le
 * paramétrage Apogée de l'établissement : les codes type de diplôme
 * (cod_tpd_etb) sont propres à chaque instance, et l'interprétation du compteur
 * d'inscriptions à l'étape dépend des conventions locales.
 *
 * Activation : SI_SCOL=APOGEE_SACLAY dans installation/.env. Sans cela, le
 * connecteur du cœur s'applique et aucune dérivation n'a lieu.
 */
class SaclayApogeeProvider extends ApogeeProvider
{
    public function getProviderId(): string
    {
        return 'apogee_saclay';
    }

    /**
     * @inheritDoc
     */
    protected function enrichirInscription(object $row): array
    {
        $cycle = $this->entier($row, 'CYCLE');
        $anneeDansDiplome = $this->entier($row, 'ANNEE_DIPLOME');
        $codeTypeDiplome = $this->chaine($row, 'COD_TPD_ETB');
        $sante = isset($row->TEM_SANTE) && trim((string) $row->TEM_SANTE) === 'O';
        $codeEtape = $this->chaine($row, 'COD_ETP');
        $codeCursusAmenage = $this->chaine($row, 'COD_SIS_CUR_AMG');
        $nombreInscriptionsEtape = $this->entier($row, 'NBR_INS_ETP');

        // Type de diplôme obligatoire : un type manquant (inscription non
        // synchronisée) ne doit pas produire de faux niveau LMD ; on retombe
        // alors sur le préfixe du code étape s'il encode le niveau.
        $niveau = (new NiveauResolver(typeDiplomeObligatoire: true))
            ->resolve($cycle, $anneeDansDiplome, $codeTypeDiplome, $sante)
            ?? (new NiveauExtractor())->extract($codeEtape);

        return [
            'niveauDerive' => $niveau,
            // Sans compteur d'inscriptions, on ne se prononce pas : annoncer
            // "non redoublant" serait une affirmation que la donnée ne porte pas.
            'redoublant' => $nombreInscriptionsEtape === null
                ? null
                : (new RedoublementCalculator())
                    ->estRedoublant($nombreInscriptionsEtape, $codeCursusAmenage),
        ];
    }

    /**
     * Lecture d'une colonne numérique : absente ou vide, elle ne vaut pas zéro.
     */
    private function entier(object $row, string $colonne): ?int
    {
        if (!isset($row->$colonne) || trim((string) $row->$colonne) === '') {
            return null;
        }

        return (int) $row->$colonne;
    }

    /**
     * Lecture d'une colonne texte : Apogée complète les colonnes de longueur
     * fixe avec des espaces, une valeur blanche n'est pas une valeur.
     */
    private function chaine(object $row, string $colonne): ?string
    {
        if (!isset($row->$colonne) || trim((string) $row->$colonne) === '') {
            return null;
        }

        return trim((string) $row->$colonne);
    }
}
