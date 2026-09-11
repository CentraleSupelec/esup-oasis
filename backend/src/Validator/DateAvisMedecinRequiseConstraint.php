<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 */

namespace App\Validator;

use Attribute;
use Symfony\Component\Validator\Constraint;

/**
 * Exige la date de l'avis du médecin avant d'éditer la décision.
 *
 * Utile aux établissements dont le document cite cet avis dans son visa : sans la date,
 * la mention légale s'imprime à trous sur une pièce qui fait courir un délai de recours.
 * Les autres n'ont rien à faire — la contrainte ne s'applique que si la variable
 * PAEH_DATE_AVIS_MEDECIN_REQUISE est mise à true, et reste sans effet sinon.
 */
#[Attribute]
class DateAvisMedecinRequiseConstraint extends Constraint
{
    public string $message = "La date de l'avis du médecin est requise pour éditer la décision.";

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}
