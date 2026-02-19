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

use Symfony\Component\Serializer\Attribute\Groups;

class LigneServiceFait
{
    #[Groups(ServicesFaits::GROUP_OUT)]
    public Utilisateur $intervenant;
    #[Groups(ServicesFaits::GROUP_OUT)]
    public TypeEvenement $type;
    #[Groups(ServicesFaits::GROUP_OUT)]
    public string $nbHeures;
    #[Groups(ServicesFaits::GROUP_OUT)]
    public ?TauxHoraire $tauxHoraire;
}
