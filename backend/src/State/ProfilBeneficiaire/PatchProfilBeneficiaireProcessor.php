<?php

/*
 * Copyright (c) 2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 */

namespace App\State\ProfilBeneficiaire;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\ProfilBeneficiaire;
use App\Repository\ProfilBeneficiaireRepository;
use App\State\DecisionAmenagementExamens\DecisionAmenagementManager;

readonly class PatchProfilBeneficiaireProcessor implements ProcessorInterface
{
    public function __construct(
        private ProfilBeneficiaireRepository $profilBeneficiaireRepository,
        private DecisionAmenagementManager $decisionAmenagementManager,
    ) {}

    /**
     * @param ProfilBeneficiaire $data
     */
    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = [],
    ): ProfilBeneficiaire {
        $entity = $this->profilBeneficiaireRepository->find($uriVariables['id']);

        $entity
            ->setLibelle($data->libelle)
            ->setActif($data->actif)
            ->setAvecTypologie($data->avecTypologie)
            ->setAvisMedicalRequis($data->avisMedicalRequis);
        $this->profilBeneficiaireRepository->save($entity, true);

        // les fiches affichent l'exigence de la date de l'avis médical sans référencer le profil
        $this->decisionAmenagementManager->invaliderDecisionsNonEnvoyees($entity);

        return new ProfilBeneficiaire($entity);
    }
}
