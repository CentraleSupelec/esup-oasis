<?php

/*
 * Copyright (c) 2024. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\ApiResource;

class IntervenantBilanFinancier
{
    public string $uid;

    public function __construct(
        public Utilisateur                                $intervenant,
        /** @var ActiviteBilanFinancier[] */ public array $activitesParPeriode = [])
    {
        $this->uid = $this->intervenant->uid;
    }

    public function ajoutActivite(PeriodeRH $periode, TypeEvenement $type, ?TauxHoraire $tauxHoraire, string $nbHeures, string $coeffCharge): void
    {
        /**
         * Pour chaque période, on sépare les activités par (type, taux, coeff charges) !
         */

        $key = $periode->id . '#' . $type->id . '#' . ($tauxHoraire?->id ?? 'undefined') . '#' . $coeffCharge;

        if (!array_key_exists($key, $this->activitesParPeriode)) {
            $this->activitesParPeriode[$key] = new ActiviteBilanFinancier();
            $this->activitesParPeriode[$key]->typeEvenement = $type;
            $this->activitesParPeriode[$key]->tauxHoraire = $tauxHoraire;
            $this->activitesParPeriode[$key]->periode = $periode;
            $this->activitesParPeriode[$key]->coeffCharges = $coeffCharge;
        }
        $this->activitesParPeriode[$key]->nbHeures = bcadd(
            $this->activitesParPeriode[$key]?->nbHeures ?? 0,
            $nbHeures
        );
    }
}