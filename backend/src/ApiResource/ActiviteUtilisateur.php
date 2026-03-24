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

use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\Ignore;

class ActiviteUtilisateur
{
    #[Groups([ActiviteBeneficiaire::OUT, ActiviteIntervenant::OUT])]
    public int $nbEvenements;
    #[Groups([ActiviteBeneficiaire::OUT, ActiviteIntervenant::OUT])]
    public string $nbHeures;

    public function __construct(
        #[Ignore]
        public string $id,
        #[Groups([ActiviteBeneficiaire::OUT, ActiviteIntervenant::OUT])]
        public Utilisateur $utilisateur,
        #[Groups([ActiviteBeneficiaire::OUT, ActiviteIntervenant::OUT])]
        public ?Campus $campus,
        #[Groups([ActiviteBeneficiaire::OUT, ActiviteIntervenant::OUT])]
        public TypeEvenement $type,
        #[Groups([ActiviteBeneficiaire::OUT, ActiviteIntervenant::OUT])]
        public ?TauxHoraire $tauxHoraire,
    ) {
        $this->nbHeures = 0;
        $this->nbEvenements = 0;
    }

    public static function methodNotAllowed(): never
    {
        throw new MethodNotAllowedHttpException([], 'Disponible uniquement via la recherche');
    }

    public static function compare(self $a, self $b): int
    {
        return match (true) {
            $a->utilisateur->nom == $b->utilisateur->nom => $a->utilisateur->prenom <=> $b->utilisateur->prenom,
            default => $a->utilisateur->nom <=> $b->utilisateur->nom,
        };
    }
}
