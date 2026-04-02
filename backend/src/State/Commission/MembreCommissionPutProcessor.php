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

namespace App\State\Commission;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\MembreCommission;
use App\Entity\Utilisateur;
use App\Repository\CommissionRepository;
use App\Repository\MembreCommissionRepository;
use App\Service\ErreurLdapException;
use App\State\Utilisateur\UtilisateurManager;
use Override;

readonly class MembreCommissionPutProcessor implements ProcessorInterface
{
    public function __construct(
        private MembreCommissionRepository $membreCommissionRepository,
        private UtilisateurManager $utilisateurManager,
        private CommissionRepository $commissionRepository,
    ) {}

    /**
     * @param MembreCommission $data
     * @param Operation $operation
     * @param array $uriVariables
     * @param array $context
     * @return MembreCommission
     * @throws ErreurLdapException
     */
    #[Override]
    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = [],
    ): MembreCommission {
        $entity = match ($data->id) {
            null => new \App\Entity\MembreCommission(),
            default => $this->membreCommissionRepository->find($data->id),
        };

        $entity->setCommission($this->commissionRepository->find($uriVariables['commissionId']));
        $utilisateur = $this->utilisateurManager->parUid($uriVariables['uid'], true);
        $entity->setUtilisateur($utilisateur);
        $entity->setRoles(match (true) {
            $utilisateur->isGestionnaire() || $utilisateur->isAdmin() => [
                Utilisateur::ROLE_MEMBRE_COMMISSION,
                Utilisateur::ROLE_ATTRIBUER_PROFIL,
                Utilisateur::ROLE_VALIDER_CONFORMITE_DEMANDE,
            ],
            default => array_unique($data->roles),
        });

        $this->membreCommissionRepository->save($entity, true);

        return new MembreCommission($entity);
    }
}
