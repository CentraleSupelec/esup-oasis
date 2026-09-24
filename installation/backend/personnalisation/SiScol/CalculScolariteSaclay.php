<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Service\SiScol;

/**
 * Calcul du niveau d'études et du redoublement de l'université Paris-Saclay.
 *
 * S'appuie sur les colonnes que renvoient les requêtes Apogée de l'établissement
 * (personnalisation/config/apogee) : cycle et type du diplôme, indicateur santé, année
 * dans le diplôme, code étape, compteur d'inscriptions à l'étape et cursus aménagé. Les
 * règles elles-mêmes (NiveauResolver, NiveauExtractor, RedoublementCalculator) reposent
 * sur le paramétrage Apogée de Paris-Saclay.
 *
 * Sélection : SI_SCOL_CALCUL=apogee_saclay.
 */
class CalculScolariteSaclay extends AbstractCalculScolarite
{
    public function getProviderId(): string
    {
        return 'apogee_saclay';
    }

    public function niveau(array $donneesSi): ?string
    {
        $colonnes = $donneesSi['colonnesRequete'] ?? [];

        // Type de diplôme obligatoire : un type manquant (inscription non synchronisée) ne
        // doit pas produire de faux niveau LMD ; on retombe alors sur le préfixe du code
        // étape, quand il encode le niveau (L1INFO, M2ARTS…).
        return (new NiveauResolver(typeDiplomeObligatoire: true))->resolve(
            $this->entier($colonnes, 'CYCLE'),
            $this->entier($colonnes, 'ANNEE_DIPLOME'),
            $this->chaine($colonnes, 'COD_TPD_ETB'),
            'O' === $this->chaine($colonnes, 'TEM_SANTE'),
        ) ?? (new NiveauExtractor())->extract($this->chaine($colonnes, 'COD_ETP'));
    }

    public function redoublant(array $donneesSi): ?bool
    {
        $colonnes = $donneesSi['colonnesRequete'] ?? [];
        $nombreInscriptionsEtape = $this->entier($colonnes, 'NBR_INS_ETP');

        // Sans compteur d'inscriptions, on ne se prononce pas : annoncer « non redoublant »
        // serait une affirmation que la donnée ne porte pas.
        if (null === $nombreInscriptionsEtape) {
            return null;
        }

        return (new RedoublementCalculator())->estRedoublant(
            $nombreInscriptionsEtape,
            $this->chaine($colonnes, 'COD_SIS_CUR_AMG'),
        );
    }

    /**
     * Lecture d'une colonne numérique : absente ou vide, elle ne vaut pas zéro.
     *
     * @param array<string, mixed> $colonnes
     */
    private function entier(array $colonnes, string $nom): ?int
    {
        $valeur = trim((string) ($colonnes[$nom] ?? ''));

        return '' === $valeur ? null : (int) $valeur;
    }

    /**
     * Lecture d'une colonne texte : Apogée complète les colonnes de longueur fixe avec des
     * espaces, une valeur blanche n'est pas une valeur.
     *
     * @param array<string, mixed> $colonnes
     */
    private function chaine(array $colonnes, string $nom): ?string
    {
        $valeur = trim((string) ($colonnes[$nom] ?? ''));

        return '' === $valeur ? null : $valeur;
    }
}
