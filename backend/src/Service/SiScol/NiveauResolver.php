<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\Service\SiScol;

/**
 * Résout le niveau d'études normalisé (L1/L2/L3/M1/M2/D1-D3…) à partir de
 * données Apogée nationales (donc valable multi-établissements) :
 *   niveau (bac+N) = niveau d'entrée du cycle du diplôme + année dans le diplôme.
 *
 * - année dans le diplôme = COD_SIS_DAA (codage SISE national, par étape),
 * - cycle = cycle du diplôme (1 = Licence/bac+0, 2 = Master/bac+3, 3 = Doctorat/bac+5).
 *
 * Piloté par configuration (OCP + DIP) : les barèmes (entrée par cycle, libellé
 * par niveau) et les surcharges par type de diplôme sont injectés, donc
 * adaptables sans toucher à l'algorithme. Les cas particuliers (santé, DUT/BUT,
 * ingénieur, PASS/LAS) se traitent en ajoutant une surcharge de configuration.
 * Tout cas non couvert renvoie null (niveau non applicable).
 */
class NiveauResolver
{
    /**
     * @param array<int,int>         $entreeParCycle    cycle Apogée => niveau d'entrée (bac+N de départ)
     * @param array<int,string>      $libelleParNiveau  bac+N => libellé normalisé (1 => 'L1' … 8 => 'D3')
     * @param array<string,?string>  $surchargeParType  code type de diplôme => libellé forcé (ou null pour vide)
     */
    public function __construct(
        private readonly array $entreeParCycle = [1 => 0, 2 => 3, 3 => 5],
        private readonly array $libelleParNiveau = [
            1 => 'L1', 2 => 'L2', 3 => 'L3', 4 => 'M1', 5 => 'M2', 6 => 'D1', 7 => 'D2', 8 => 'D3',
        ],
        private readonly array $surchargeParType = [],
    ) {
    }

    /**
     * @param int|null    $cycle            cycle du diplôme (Apogée cod_cyc)
     * @param int|null    $anneeDansDiplome année dans le diplôme (Apogée cod_sis_daa)
     * @param string|null $codeTypeDiplome  type de diplôme (pour les surcharges cas particuliers)
     */
    public function resolve(?int $cycle, ?int $anneeDansDiplome, ?string $codeTypeDiplome = null): ?string
    {
        // 1. Cas particuliers pilotés en config (santé, DUT/BUT, ingénieur…) : priorité.
        if ($codeTypeDiplome !== null && array_key_exists($codeTypeDiplome, $this->surchargeParType)) {
            return $this->surchargeParType[$codeTypeDiplome];
        }

        // 2. Cas nominal LMD : entrée(cycle) + année dans le diplôme.
        if ($cycle === null || $anneeDansDiplome === null || $anneeDansDiplome < 1) {
            return null;
        }
        if (!array_key_exists($cycle, $this->entreeParCycle)) {
            return null;
        }

        $bacPlusN = $this->entreeParCycle[$cycle] + $anneeDansDiplome;

        // 3. Fallback : null (niveau vide) si hors barème.
        return $this->libelleParNiveau[$bacPlusN] ?? null;
    }
}
