<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\ApiResource;

class ActiviteBilanFinancier
{
    public PeriodeRH $periode;
    public TypeEvenement $typeEvenement;
    public ?TauxHoraire $tauxHoraire;
    public string $nbHeures;
    public string $coeffCharges;

    public function getMontantBrut(): string
    {
        return bcadd(bcmul($this->nbHeures, $this->tauxHoraire?->montant ?? '0'), 0, 2);
    }

    public function getMontantBrutCharge(): string
    {
        return bcadd(bcmul($this->getMontantBrut(), $this->coeffCharges), 0, 2);
    }

    public function getNbHeures(): string
    {
        return bcadd($this->nbHeures, 0, 2);
    }
}
