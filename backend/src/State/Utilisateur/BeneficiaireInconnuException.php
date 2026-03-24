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

namespace App\State\Utilisateur;

use App\Entity\Utilisateur;
use Exception;

class BeneficiaireInconnuException extends Exception
{
    /**
     * @param Utilisateur $utilisateur
     * @param int         $idBeneficiaire
     */
    public function __construct(
        protected Utilisateur $utilisateur,
        protected int $idBeneficiaire,
    ) {
        parent::__construct($utilisateur->getUid() . " n'a pas de beneficiaire d'id " . $idBeneficiaire);
    }
}
