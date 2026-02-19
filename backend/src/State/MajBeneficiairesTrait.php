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

namespace App\State;

use App\ApiResource\Utilisateur;
use App\Entity\BeneficiairesManagerInterface;

trait MajBeneficiairesTrait
{
    /**
     * @param Utilisateur[]                 $beneficiaires
     * @param BeneficiairesManagerInterface $entity
     * @return void
     */
    private function majBeneficiaires(array $beneficiaires, BeneficiairesManagerInterface $entity): void
    {
        foreach ($beneficiaires as $ressource) {
            $utilisateur = $this->utilisateurRepository->findOneBy([
                'uid' => $ressource->uid,
            ]);
            foreach ($utilisateur->getBeneficiaires() as $beneficiaire) {
                if ($entity->canHaveBeneficiaire($beneficiaire)) {
                    $entity->addBeneficiaire($beneficiaire);
                }
            }
        }
        foreach ($entity->getBeneficiaires() as $existant) {
            foreach ($beneficiaires as $ressource) {
                $utilisateur = $this->utilisateurRepository->findOneBy([
                    'uid' => $ressource->uid,
                ]);
                foreach ($utilisateur->getBeneficiaires() as $beneficiaire) {
                    if ($beneficiaire === $existant && $entity->canHaveBeneficiaire($beneficiaire)) {
                        continue 3;
                    }
                }
            }
            $entity->removeBeneficiaire($existant);
        }

        /**
         * Péter une erreur
         */
        /**
         * A tester un jour pour s'amuser :
         *
         * foreach (array_udiff($entity->getBeneficiaires()->toArray(), $beneficiaires, fn($a, $b) => $a->getId() <=> $b->id) as $absent) {
         *    $entity->removeBeneficiaire($absent);
         * }*/
    }
}
