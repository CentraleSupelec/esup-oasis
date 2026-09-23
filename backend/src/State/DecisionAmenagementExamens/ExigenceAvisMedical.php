<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\State\DecisionAmenagementExamens;

use App\Entity\Beneficiaire;
use App\Entity\DecisionAmenagementExamens;

/**
 * Détermine si l'édition d'une décision d'aménagements est conditionnée à un avis
 * médical.
 *
 * L'exigence se configure par profil de bénéficiaire (ProfilBeneficiaire::avisMedicalRequis) :
 * elle s'applique dès qu'un des profils détenus par le bénéficiaire sur la période de la
 * décision l'active. Aucun profil ne l'active par défaut, si bien qu'une instance qui ne
 * paramètre rien garde le comportement historique.
 */
readonly class ExigenceAvisMedical
{
    public function estRequisePour(DecisionAmenagementExamens $decision): bool
    {
        $beneficiaire = $decision->getBeneficiaire();
        if (null === $beneficiaire || null === $decision->getDebut() || null === $decision->getFin()) {
            return false;
        }

        // Tous les profils de la période comptent, accompagnés ou non : un étudiant
        // en situation de handicap peut bénéficier d'aménagements sans accompagnement.
        $profils = $beneficiaire->getBeneficiairesParIntervalle(
            $decision->getDebut(),
            $decision->getFin(),
            avecAccompagnement: false,
        );

        return array_any(
            $profils,
            fn(Beneficiaire $profil) => true === $profil->getProfil()?->isAvisMedicalRequis(),
        );
    }
}
