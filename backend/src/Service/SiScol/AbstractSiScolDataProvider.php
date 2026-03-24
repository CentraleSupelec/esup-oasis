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

namespace App\Service\SiScol;

use App\Entity\Formation;
use App\Entity\Utilisateur;
use DateTimeInterface;

abstract class AbstractSiScolDataProvider
{
    /**
     * Tableau listant les formations auxquelles est inscrit l'étudiant sur l'intervalle de temps donné
     * [[codeFormation, libFormation, codeComposante, libComposante, debut, fin], ...]
     *
     * @param Utilisateur        $etudiant
     * @param DateTimeInterface  $debut
     * @param ?DateTimeInterface $fin
     * @return array
     * @throws BackendUnavailableException
     */
    abstract public function getInscriptions(
        Utilisateur $etudiant,
        DateTimeInterface $debut,
        ?DateTimeInterface $fin,
    ): array;

    /**
     * @param Formation $incomplete
     * @return array
     * @throws BackendUnavailableException
     */
    abstract public function getFormation(Formation $incomplete): array;
}
