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

use App\Entity\Composante;
use App\Entity\Formation;
use App\Repository\ComposanteRepository;
use App\Repository\FormationRepository;

final readonly class FormationManager
{
    public function __construct(
        private FormationRepository $formationRepository,
        private ComposanteRepository $composanteRepository,
    ) {}

    public function getFormation(
        string $codeFormation,
        string $libFormation,
        string $codeComposante,
        string $libComposante,
        ?string $niveau,
        ?string $discipline,
        ?string $diplome,
    ): Formation {
        $formation = $this->formationRepository->findOneBY([
            'codeExterne' => $codeFormation,
        ]);
        if (null === $formation) {
            $formation = new Formation();
            $formation
                ->setCodeExterne($codeFormation)
                ->setLibelle($libFormation)
                ->setComposante($this->getComposante(code: $codeComposante, libelle: $libComposante))
                ->setNiveau($niveau)
                ->setDiscipline($discipline)
                ->setDiplome($diplome);
            $this->formationRepository->save($formation, true);
        } else {
            //ajout de niveau / disciplines après coup pour le bilan activité...
            if (
                null === $formation->getNiveau() && $niveau !== null
                || null === $formation->getDiscipline() && $discipline !== null
                || null === $formation->getDiplome() && $diplome !== null
            ) {
                $formation->setNiveau($niveau)->setDiscipline($discipline)->setDiplome($diplome);
                $this->formationRepository->save($formation, true);
            }
        }

        return $formation;
    }

    private function getComposante(string $code, string $libelle): Composante
    {
        $composante = $this->composanteRepository->findOneBy([
            'codeExterne' => $code,
        ]);
        if (null === $composante) {
            $composante = new Composante();
            $composante->setCodeExterne($code)->setLibelle($libelle);
            $this->composanteRepository->save($composante, true);
        }
        return $composante;
    }
}
